#!/usr/bin/env bun
/**
 * Turns the scaffold into a fresh project:
 *
 *   1. Renames the `@scaffold/*` workspace scope
 *   2. Strips demo content (files, plus regions marked `demo:start`/`demo:end`)
 *   3. Replaces the README with a minimal project one
 *   4. Rebuilds the database and removes itself
 *
 * This rewrites the repository in place and cannot be undone, so it asks for
 * confirmation unless `--yes` is passed.
 *
 * Usage:
 *   bun run init                    # prompts for a name, then confirms
 *   bun run init my-app             # prompts for confirmation only
 *   bun run init my-app --dry-run   # show the plan, change nothing
 *   bun run init my-app --yes       # skip confirmation (scripted use)
 *   bun run init my-app --keep-demo # rename only, keep the routing demo
 */
import { $ } from 'bun'
import { readdir, rm } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dir, '..')

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const dryRun = flags.has('--dry-run')
const keepDemo = flags.has('--keep-demo')
const assumeYes = flags.has('--yes')
const nameArg = args.find((a) => !a.startsWith('--'))

const OLD_SCOPE = 'scaffold'

/** Files deleted outright when demo content is stripped. */
const DEMO_FILES = ['frontend/src/pages/RoutingDemoPage.tsx', 'frontend/src/pages/demoData.ts']

/** Files whose `demo:start` … `demo:end` regions are removed. */
const DEMO_MARKED_FILES = [
  'frontend/src/App.tsx',
  'frontend/src/components/Layout.tsx',
  'frontend/src/pages/HomePage.tsx',
  'frontend/src/pages/NotFoundPage.tsx',
]

/** Directories skipped when rewriting the workspace scope. */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vscode',
  '.idea',
])

const REWRITE_EXTENSIONS = ['.ts', '.tsx', '.json', '.md', '.yml', '.yaml', '.html']

function isValidName(name: string): boolean {
  // npm package name rules, restricted to what makes a sane scope.
  return /^[a-z0-9][a-z0-9._-]*$/.test(name) && name.length <= 214
}

async function prompt(question: string): Promise<string> {
  process.stdout.write(question)
  for await (const line of console) return line.trim()
  return ''
}

async function collectFiles(dir: string, out: string[] = []): Promise<string[]> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue

    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(full, out)
    } else if (REWRITE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      out.push(full)
    }
  }
  return out
}

/**
 * Removes each `demo:start` … `demo:end` region. Handles both comment styles
 * the markers appear in: `// …` in module scope and `{/* … *\/}` inside JSX.
 *
 * Each alternative stops at its own closing marker and consumes only the rest
 * of that line, so surrounding blank lines are preserved rather than swallowed.
 */
function stripMarkedRegions(source: string): string {
  const pattern = new RegExp(
    '[ \\t]*(?:' +
      // Line-comment form: // demo:start … // demo:end
      '\\/\\/[ \\t]*demo:start[\\s\\S]*?\\/\\/[ \\t]*demo:end' +
      '|' +
      // JSX form: {/* demo:start */} … {/* demo:end */}
      '\\{\\s*\\/\\*[ \\t]*demo:start[\\s\\S]*?demo:end[ \\t]*\\*\\/\\s*\\}' +
      ')[ \\t]*\\r?\\n?',
    'g',
  )

  // Collapse the blank-line runs left behind by removed blocks.
  return source.replace(pattern, '').replace(/\n{3,}/g, '\n\n')
}

async function main() {
  const name = nameArg ?? (await prompt('Project name (lowercase, no spaces): '))

  if (!name) {
    console.error('A project name is required.')
    process.exit(1)
  }

  if (!isValidName(name)) {
    console.error(
      `"${name}" is not a valid package name. Use lowercase letters, digits, '-', '_' or '.'.`,
    )
    process.exit(1)
  }

  if (name === OLD_SCOPE) {
    console.error(`The project is already named "${OLD_SCOPE}". Choose a different name.`)
    process.exit(1)
  }

  console.log(`\n${dryRun ? '[dry run] ' : ''}Initialising "${name}"\n`)

  // This rewrites files in place and reinstalls dependencies. Confirm first,
  // because there is no undo short of version control.
  if (!dryRun && !assumeYes) {
    console.log('This will rewrite this repository in place:')
    console.log(`  • rename @${OLD_SCOPE}/* → @${name}/* across all workspaces`)
    if (!keepDemo) console.log('  • delete the demo pages and their routes')
    console.log('  • replace README.md and remove scripts/init.ts')
    console.log('  • reinstall dependencies and rebuild the database\n')

    const answer = (await prompt(`Continue? [y/N] `)).toLowerCase()
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Aborted — nothing was changed.')
      process.exit(1)
    }
    console.log('')
  }

  // 1. Rewrite the workspace scope.
  const files = await collectFiles(ROOT)
  const scopePattern = new RegExp(`@${OLD_SCOPE}/`, 'g')
  let rewritten = 0

  for (const file of files) {
    const original = await Bun.file(file).text()
    let updated = original.replace(scopePattern, `@${name}/`)

    // The root package.json "name" field, and nothing else.
    if (file === join(ROOT, 'package.json')) {
      updated = updated.replace(`"name": "${OLD_SCOPE}"`, `"name": "${name}"`)
    }

    if (updated !== original) {
      rewritten++
      if (dryRun) console.log(`  rename scope  ${relative(ROOT, file)}`)
      else await Bun.write(file, updated)
    }
  }
  console.log(`✓ Renamed @${OLD_SCOPE}/* → @${name}/* in ${rewritten} files`)

  // 2. Strip demo content.
  if (keepDemo) {
    console.log('• Keeping demo content (--keep-demo)')
  } else {
    for (const relPath of DEMO_FILES) {
      const full = join(ROOT, relPath)
      if (!(await Bun.file(full).exists())) continue
      if (dryRun) console.log(`  delete        ${relPath}`)
      else await rm(full, { force: true })
    }

    for (const relPath of DEMO_MARKED_FILES) {
      const full = join(ROOT, relPath)
      const original = await Bun.file(full).text()
      const updated = stripMarkedRegions(original)

      if (updated === original) continue
      if (dryRun) console.log(`  strip demo    ${relPath}`)
      else await Bun.write(full, updated)
    }
    console.log('✓ Removed demo pages and their routes, links, and imports')
  }

  // 3. Fresh README.
  const readme = `# ${name}

Built from a Bun + Hono + React scaffold.

## Getting started

\`\`\`bash
cp .env.example .env
bun run setup
bun run dev
\`\`\`

Seeded login: \`test@example.com\` / \`password123\`

## Commands

| Command | Description |
| --- | --- |
| \`bun run dev\` | Run backend and frontend |
| \`bun run check\` | Typecheck, lint, and test |
| \`bun run db:generate\` | Generate a migration after editing \`database/schema.ts\` |
| \`bun run db:migrate\` | Apply pending migrations |
| \`bun run db:reset\` | Rebuild the database from scratch |

See \`CLAUDE.md\` for architecture conventions and \`database/MIGRATIONS.md\`
before changing the schema.
`

  if (dryRun) console.log('  rewrite       README.md')
  else await Bun.write(join(ROOT, 'README.md'), readme)
  console.log('✓ Wrote a fresh README.md')

  // 4. Remove this script and its package.json entry. Only this file — the rest
  //    of scripts/ (the pre-commit formatter) is part of the project.
  if (!dryRun) {
    const pkgPath = join(ROOT, 'package.json')
    const pkg = await Bun.file(pkgPath).json()
    delete pkg.scripts.init
    await Bun.write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    await rm(import.meta.path, { force: true })
  }
  console.log('✓ Removed the init script')

  if (dryRun) {
    console.log('\nDry run complete — nothing was changed.')
    return
  }

  // 5. Normalise formatting. Stripping marked regions and rewriting package.json
  //    leaves artefacts that would otherwise fail `bun run format:check`.
  await $`bunx prettier --write .`.cwd(ROOT).quiet().nothrow()
  console.log('✓ Formatted')

  // 6. Reinstall so the renamed workspace links resolve, then rebuild the DB.
  console.log('\nReinstalling dependencies and rebuilding the database…\n')
  await $`bun install`.cwd(ROOT)
  await $`bun run db:reset`.cwd(ROOT)

  console.log(`
Done. "${name}" is ready.

  bun run dev      start developing
  bun run check    typecheck, lint, test

Consider starting a fresh history:
  rm -rf .git && git init && git add -A && git commit -m "Initial commit"
`)
}

await main()
