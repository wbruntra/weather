# Working in this repo

Bun monorepo: Hono API (`backend/`), React + Vite SPA (`frontend/`), Kysely +
SQLite (`database/`), shared constants (`shared/`).

Read `README.md` for the command list and `database/MIGRATIONS.md` before
touching the schema.

## Runtime

**Targets Bun 1.4+** (currently the canary build — `bun upgrade --canary`).
Assume 1.4 APIs are available; do not add compatibility shims for 1.3.

Default to Bun over Node.

- `bun <file>`, not `node <file>` or `ts-node <file>`
- `bun test`, not jest or vitest
- `bun install`, not npm/yarn/pnpm
- `bun run <script>`, not `npm run <script>`
- Bun loads `.env` automatically — never add `dotenv`
- `bun run --parallel a b` runs scripts concurrently — no `concurrently` package

Prefer Bun built-ins over native-module packages, which break across ABI
changes: `bun:sqlite` (not `better-sqlite3`), `Bun.password` (not `bcrypt`),
`Bun.redis` (not `ioredis`), `Bun.sql` (not `pg`), `WebSocket` (built in),
`Bun.file` (over `node:fs` read/write), `Bun.$` (not execa).

## Backend

Hono, not Express and not raw `Bun.serve` routes.

- Routes live in `backend/routes/` as chained `new Hono()` sub-apps and are
  composed in `backend/app.ts`. **Keep the chain in `app.ts` unbroken** — the
  frontend's RPC types are inferred from `typeof routes`, and splitting the
  chain silently erases that type safety.
- `backend/index.ts` only binds the port. Import `app.ts` when you need the app
  without starting a server (tests, type inference).
- Protect a route with `requireAuth` from `middleware/auth.ts`, then read
  `c.get("user")`. Type the sub-app as `new Hono<AppEnv>()`.
- Throw `HTTPException` for failures. `app.onError` renders the shared error
  envelope, so handlers need no try/catch.
- Validate input with `validate("json", schema)` from `lib/validate.ts`, not
  `zValidator` directly — the wrapper routes failures through the same envelope.
- Never return a password hash. `userService` selects an explicit column list
  for this reason; keep it that way when adding columns.
- Read config from `backend/config.ts`, never `process.env` directly.

## Database

- Kysely, not Drizzle. There is no schema-diffing tool — migrations are
  hand-written. Run `bun run db:generate <name>` to scaffold a migration file
  under `database/migrations/`, fill in `up()`/`down()`, then
  `bun run db:migrate` to apply it.
- After writing a migration, update the matching table interface in
  `database/schema.ts` by hand so the query builder's types stay accurate.
  Never edit an applied migration; add a new one instead.
- `database/db.ts` opens `bun:sqlite` directly and wraps it with
  `kysely-bun-dialects`' `BunSqliteDialect` — no native database driver
  (`better-sqlite3` breaks across Node ABI changes and must not be added).
- `database/db.ts` registers Kysely's `CamelCasePlugin`, so table interfaces
  in `schema.ts` and app code use camelCase fields while the actual SQLite
  columns stay snake_case.
- Use `sql` for expression defaults — `.defaultTo("CURRENT_TIMESTAMP")` stores
  the string literally; wrap it as `` sql`(CURRENT_TIMESTAMP)` `` instead.
- Migration files must type their `Kysely<any>` parameter as `any`, never the
  app's `DB` type — migrations must keep working after `schema.ts` changes.
  See `database/MIGRATIONS.md`.

## Frontend

Vite + React 19 + Redux Toolkit. HTML imports with `Bun.serve` are **not** used.

- Call the API through the typed client in `src/lib/api.ts`; do not hand-write
  request or response types, and do not add axios or a raw `fetch` wrapper.
- Use `useAppDispatch`/`useAppSelector` from `src/store/hooks.ts` — the untyped
  react-redux hooks require `as any` at dispatch sites.
- Path alias `@/*` maps to `src/*`.

## Testing

`bun test` from `backend/`. Each run builds a throwaway SQLite database from
migrations, so tests must not depend on seed data or on ordering between files.
Use the helpers in `test/helpers.ts` and drive routes in-process via
`app.fetch`; call `resetUsers()` in `beforeEach`.

## Formatting

`bun fmt` owns formatting (Bun's built-in Prettier-compatible formatter,
configured by `prettier.config.js`): **single quotes, no semicolons**, 99-column
width, trailing commas. Match it when writing code, or just run `bun fmt`. Never hand-format against it, and do not add
formatting rules to oxlint — they would conflict.

A pre-commit hook in `.githooks/` runs `bun fmt --staged` automatically.

## Before finishing

Run `bun run check` from the repo root — format check, typecheck, lint, test.
