// PM2 process file for the backend. Named `.cjs` because `package.json` sets
// `"type": "module"`, which would otherwise make PM2's `require()` of a
// plain `.js` config fail.
//
// Usage (from repo root or backend/ — the `cwd` below is fixed either way):
//   pm2 start backend/ecosystem.config.cjs
//   pm2 restart backend/ecosystem.config.cjs
//   pm2 stop backend/ecosystem.config.cjs

const path = require('node:path')

// Bun only auto-loads `.env` from its cwd, not parent directories, and this
// repo's `.env` lives at the repo root (see README.md) — so cwd must be the
// root, not backend/, or the app silently falls back to dev defaults.
const repoRoot = path.join(__dirname, '..')

module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: repoRoot,
      // PM2's `interpreter: 'bun'` wraps the script with a loader that calls
      // `require()` on it; Bun's ESM output is async and that require()
      // throws ("require() async module ... unsupported"), crash-looping
      // the process. Running `bun` itself as the script sidesteps PM2's
      // wrapper entirely.
      script: 'bun',
      args: 'run ./backend/index.ts',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      // Bun's dev-mode --watch is intentionally not used here — PM2 owns
      // restart supervision in production.
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      // Give the SIGINT/SIGTERM handler in index.ts a chance to call
      // server.stop() before PM2 escalates to SIGKILL.
      kill_timeout: 5000,
    },
  ],
}
