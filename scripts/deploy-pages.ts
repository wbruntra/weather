/**
 * Builds the frontend for GitHub Pages and publishes it to the `gh-pages`
 * branch of `origin`, which Pages serves at https://<owner>.github.io/<repo>/.
 *
 *   bun run deploy
 *
 * The branch holds only build output and is force-pushed on every deploy.
 */
import { $ } from 'bun'
import path from 'path'

const root = path.resolve(import.meta.dir, '..')
const dist = path.join(root, 'frontend/dist')

const remote = (await $`git -C ${root} remote get-url origin`.text()).trim()
const repo = remote.match(/[/:]([^/]+?)(?:\.git)?$/)?.[1]
if (!repo) throw new Error(`Cannot read the repository name from origin (${remote})`)

await $`bun run --cwd frontend build`.cwd(root).env({ ...process.env, BASE_PATH: `/${repo}/` })

// Pages has no SPA rewrites: an unknown path like /weather/search serves
// 404.html, so make that the app too and let the router handle it.
await Bun.write(path.join(dist, '404.html'), Bun.file(path.join(dist, 'index.html')))
// Skip Jekyll processing; the build output is already final.
await Bun.write(path.join(dist, '.nojekyll'), '')

const sha = (await $`git -C ${root} rev-parse --short HEAD`.text()).trim()
await $`rm -rf .git && git init -q -b gh-pages && git add -A && git commit -qm ${`Deploy ${sha}`}`.cwd(
  dist,
)
await $`git push -f ${remote} gh-pages`.cwd(dist)
await $`rm -rf .git`.cwd(dist)

console.log(`✓ Deployed ${sha} to gh-pages`)
