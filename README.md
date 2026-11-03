# Full-Stack Scaffold

A Bun monorepo starter: **Hono** API, **React 19 + Vite** SPA, **Kysely** over SQLite, with end-to-end type safety between backend and frontend.

## Requirements

**Bun 1.4 or newer.** 1.4 is not yet released, so install the canary build:

```bash
bun upgrade --canary
```

CI tracks `canary` for the same reason. Once 1.4 ships, pin `bun-version` in
`.github/workflows/ci.yml` to `1.4.x` and drop the canary requirement.

## Quick start

```bash
git clone <your-repo> && cd scaffold
cp .env.example .env
bun run init      # rename the project and strip the demo pages (optional)
bun run setup     # install, install git hooks, migrate, seed
bun run dev       # backend + frontend together
```

`bun run init` turns the scaffold into your own project: it renames the
`@scaffold/*` workspace scope, deletes the routing-demo pages and their routes,
and writes a fresh README. Preview it first with `bun run init my-app --dry-run`,
or keep the demo with `--keep-demo`. The script deletes itself afterwards.

The frontend runs on Vite's default port and proxies `/api` to the backend on
`3660` (see `shared/config.ts`). Sign in with the seeded account:

```
test@example.com / password123
```

## Deploying

See [ansible/README.md](ansible/README.md) for the Ansible playbooks (pm2 + nginx).
All values in that directory are placeholders.

## Commands

| Command                | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `bun run init`         | Rename the project and strip demo content (run once)         |
| `bun run setup`        | Install dependencies, install git hooks, migrate, seed       |
| `bun run dev`          | Run backend and frontend in parallel                         |
| `bun run check`        | Format check, typecheck, lint, test — what CI runs           |
| `bun run test`         | Backend test suite                                           |
| `bun run typecheck`    | Typecheck all workspaces                                     |
| `bun run lint`         | Lint the frontend (oxlint)                                   |
| `bun run format`       | Format everything with `bun fmt`                             |
| `bun run format:check` | Fail if anything is unformatted                              |
| `bun run build`        | Production frontend build                                    |
| `bun run db:generate`  | Scaffold a new migration file (`bun run db:generate <name>`) |
| `bun run db:migrate`   | Apply pending migrations                                     |
| `bun run db:seed`      | Insert development data (idempotent)                         |
| `bun run db:reset`     | Drop the database and rebuild it from scratch                |

## Layout

```
backend/     Hono API
  app.ts         route composition + middleware; exports AppType for RPC
  index.ts       server entry (port binding only)
  config.ts      validated env, fails fast in production
  routes/        route modules + zod schemas
  services/      business logic
  middleware/    requireAuth, request logging
  lib/           error envelope, validation wrapper
  test/          route- and service-level tests
database/    Kysely schema types, migrations, seed
frontend/    React SPA (Redux Toolkit, React Router)
preact-frontend/  Alternative SPA: Preact, Preact Signals, TanStack Query, preact-iso (`bun run frontend:preact`)
  src/lib/api.ts  typed RPC client generated from the backend
shared/      Constants shared across workspaces
```

## How things fit together

**Type safety across the wire.** `backend/app.ts` exports `AppType`, derived
from the chained route definitions. `frontend/src/lib/api.ts` builds a Hono RPC
client from that type, so request and response shapes are inferred from the
backend. Changing a route's payload produces a frontend type error rather than a
runtime surprise — keep the route chain in `app.ts` unbroken or that inference
is lost.

**Adding a protected route.**

```ts
// backend/routes/widgets.ts
import { Hono } from 'hono'
import { requireAuth, type AppEnv } from '../middleware/auth'

export const widgetRoutes = new Hono<AppEnv>().use('*', requireAuth).get('/', async (c) => {
  const { id } = c.get('user') // typed, populated by requireAuth
  return c.json({ widgets: [] })
})
```

Then add `.route("/api/widgets", widgetRoutes)` to the chain in `app.ts`.

**Errors.** Throw `HTTPException` — `app.onError` renders every failure as
`{ error: { message, status } }`. Handlers need no try/catch.

**Validation.** Use `validate("json", schema)` from `lib/validate.ts` rather
than `zValidator` directly, so failures use the same error envelope and report
field-level issues.

**Migrations.** Run `bun run db:generate <name>` to scaffold a migration file,
write its `up()`/`down()`, then `bun run db:migrate`. Kysely has no
schema-diffing tool, so migrations are always hand-written; update the
matching table interface in `database/schema.ts` afterward so query types stay
accurate. Migrations run through `database/db.ts`'s `bun:sqlite` connection, so
there is no native-module dependency. See `database/MIGRATIONS.md`.

**Tests.** Each run builds a throwaway SQLite database from migrations in the
temp directory, so tests never touch development data and never depend on
leftover state. Drive routes in-process with the helpers in `test/helpers.ts`.

## Formatting

`bun fmt` is the single formatting authority (Bun's built-in formatter, configured
by `prettier.config.js`): single quotes, no semicolons, 99-column width. `bun run setup` points
`core.hooksPath` at `.githooks`, so a pre-commit hook formats staged files and
restages them automatically — no husky or lint-staged.

A file with **both staged and unstaged changes** aborts the commit rather than
being formatted, because rewriting it would sweep the unstaged work into your
commit. Stage the rest of the file (or `git stash --keep-index`) and retry. Bypass the hook entirely with
`git commit --no-verify`.

If you cloned without running setup, install the hook with
`bun run hooks:install` — git does not clone hook configuration.

## Configuration

All settings are optional in development and read from `.env` (Bun loads it
automatically). `JWT_SECRET` is **required** when `NODE_ENV=production` — the
app refuses to start without it rather than falling back to a known default.
See `.env.example`.

## Notes

- Every database command runs through `bun:sqlite` (via Kysely's
  `kysely-bun-dialects` driver) — no native database module dependency.
- Passwords are hashed with `Bun.password` (argon2id). `Bun.password.verify`
  auto-detects the algorithm, so bcrypt hashes from older data still verify.
