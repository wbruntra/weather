# Napkin

## Corrections

| Date       | Source | What Went Wrong                                                                          | What To Do Instead                                                             |
| ---------- | ------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 2026-08-14 | self   | `baseUrl` in tsconfig failed with TS5102 under TypeScript v7                             | Remove `baseUrl`; TypeScript 7 uses relative paths directly in `paths` mapping |
| 2026-08-14 | self   | Exporting constants alongside components triggered Oxlint `react/only-export-components` | Move shared data/constants into separate data module (e.g. `demoData.ts`)      |

## User Preferences

- (accumulate here as you learn them)

## Patterns That Work

- Oxlint integration with `.oxlintrc.json` using plugins `["react", "typescript", "oxc"]`
- Vite v8 with `import.meta.dirname` for path resolution
- React Router in declarative SPA mode (`<BrowserRouter>`, `<Routes>`, `<Route>`, `<Outlet>`, `<NavLink>`)
- Drizzle Kit's `sqlite` dialect prefers `@libsql/client` over `better-sqlite3`, so installing it as a dev dependency makes `db:studio`/`push` work under Bun (libsql is native but N-API, so it loads; better-sqlite3's V8 bindings do not). Migrations still run through `drizzle-orm/bun-sqlite`.

## Patterns That Don't Work

- Using `baseUrl: "."` in `tsconfig.json` with TypeScript v7+ (option removed)
- `__dirname` in Vite config (triggers warning with `configLoader: 'native'`)

## Domain Notes

- (project/domain context that matters)
