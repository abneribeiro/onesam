# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

OneSAM is a Portuguese LMS (Learning Management System) monorepo with two packages:
- `api/` -- Express 5 + TypeScript backend (Drizzle ORM, PostgreSQL, Better Auth)
- `web/` -- Next.js 16 + React 19 frontend (TanStack Query, TailwindCSS 4, Radix UI)

Runtime and package manager: **Bun** (not npm/yarn/pnpm).

## Build / Lint / Test Commands

All commands run from within `api/` or `web/` directories.

### API (`api/`)

```bash
bun dev                    # start dev server (port 3000)
bun build                  # production build
bun run typecheck          # tsc --noEmit
bun run lint               # ESLint
bun run lint:fix           # auto-fix lint issues
bun test                             # all tests
bun test src/__tests__/services/health.service.test.ts   # single test file
bun test --testNamePattern="should create user"          # single test by name
bun run test:services                # service tests only
bun run test:integration             # integration tests only
bun run test:security                # security tests only
bun run db:generate        # generate Drizzle migrations
bun run db:push            # push schema to DB (dev only)
bun run db:migrate         # apply migrations (production)
bun run seed               # seed database
bun run seed:clean         # clean and re-seed
```

### Web (`web/`)

```bash
bun dev                    # start dev server (port 3001)
bun build                  # production build
bun run typecheck          # tsc --noEmit
bun run lint               # ESLint
bun run lint:fix           # auto-fix lint issues
```

### Post-Edit Verification

After modifying code, always run in the relevant directory:
1. `bun run typecheck` then 2. `bun run lint` -- fix all errors before considering the task done.

## Architecture

### Backend Layers (`Route -> Middleware -> Controller -> Service -> Repository -> Database`)

- **Routes** (`api/src/routes/{entity}Routes.ts`): Express routers with middleware chains.
- **Controllers** (`api/src/controllers/{entity}Controller.ts`): Request handlers, exported as named arrow functions.
- **Services** (`api/src/services/{entity}Service.ts`): Business logic classes with a singleton export.
- **Repositories** (`api/src/repositories/{entity}Repository.ts`): Drizzle ORM data access classes with a singleton export.
- **Schemas** (`api/src/schemas/{entity}Schemas.ts`): Zod validation schemas for request validation.
- **Database schema** (`api/src/database/schema/index.ts`): All Drizzle table definitions in one file.

### Frontend Structure
- **Pages**: Next.js App Router in `web/src/app/` with route groups `(admin)`, `(auth)`, `(dashboard)`.
- **Services** (`web/src/services/`): API client classes with singleton exports. Pattern: `{entity}.service.ts`.
- **Query hooks** (`web/src/hooks/queries/`): TanStack Query hooks. Pattern: `use{Entity}.ts`.
- **UI components** (`web/src/components/ui/`): shadcn/ui base components.
- **Feature components** (`web/src/components/features/`): Domain-specific components.

## Code Style

- TypeScript throughout. Strict mode enabled.
- No emojis in code, comments, or commit messages.
- Minimal comments -- only for complex regex, non-obvious workarounds, or library hacks.
- No placeholder code (`// TODO`, `// implement later`). Write complete implementations.
- All user-facing strings, DB columns, error messages, and domain terms are in **Portuguese**.
- Avoid `any` types where possible (ESLint `no-explicit-any` is off in API, but prefer proper types).
- Use `type` imports: `import type { Foo } from './bar'`.
- Path aliases: `@/*` maps to `src/*` in both packages.
- Unused variables: prefix with `_` (e.g., `_req`, `_unused`).
- Strict null checks, no implicit returns, no fallthrough in switch.

### Imports (observed ordering)

1. External packages (`express`, `drizzle-orm`, `react`, `@tanstack/react-query`)
2. Internal aliases (`@/services/...`, `@/lib/...`, `@/types`)
3. Relative imports (`../repositories/...`, `./utils/...`)
4. Type-only imports last or alongside their source with `import type`

### Naming Conventions

- **Files**: camelCase for API (`areaService.ts`, `areaController.ts`), kebab-case for web services (`area.service.ts`).
- **Classes**: PascalCase (`AreaService`, `AreaRepository`).
- **Exported singletons**: camelCase instance after class definition (`export const areaService = new AreaService()`).
- **Controllers**: Named arrow function exports (`export const criarArea = async (...) => { ... }`).
- **DB tables**: PascalCase Portuguese (`Utilizadores`, `Cursos`, `Inscricoes`).
- **DB columns**: PascalCase Portuguese (`NomeCurso`, `DataCriacao`, `IDUtilizador`).
- **Zod schemas**: camelCase (`createAreaSchema`, `updateAreaSchema`).
- **Query keys**: factory pattern (`areaKeys.all`, `areaKeys.detail(id)`).
- **React hooks**: `use{Entity}` for queries, `useCreate{Entity}` / `useUpdate{Entity}` / `useDelete{Entity}` for mutations.
- **Domain terms**: Portuguese (utilizador, curso, inscricao, formando, area, categoria, modulo, aula).

### Error Handling

**API controllers**: Wrap body in try/catch, call `next(error)` in catch block:
```typescript
export const handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        sendData(res, result);
    } catch (error) {
        next(error);
    }
};
```

**API responses**: Use helpers from `utils/responseHelper.ts`:
- `sendData(res, data, statusCode?)` -- success with data
- `sendNotFound(res, message?)` -- 404
- `sendBadRequest(res, message?)` -- 400
- `sendNoContent(res)` -- 204
- `sendCreated(res, message, data?)` -- 201

**Web services**: Wrap API calls in try/catch, use `handleApiError(error, context)`:
```typescript
async getAll(): Promise<Foo[]> {
    try { return await apiService.get<Foo[]>('/endpoint'); }
    catch (error: unknown) { return handleApiError(error, 'listar items'); }
}
```

**Web mutations**: Use `onError` callback with `toast.error()` from sonner.

### Testing

- Test framework: Bun's built-in test runner (`bun:test`).
- Test files: `api/src/__tests__/{category}/{name}.test.ts`.
- Imports: `import { describe, test, expect, beforeEach, afterAll } from 'bun:test'`.
- Test utilities: `api/src/__tests__/setup.ts` (TestUtils, SecurityTestUtils, PerformanceTestUtils).
- Tests are excluded from ESLint and production tsconfig.

### Commit Messages

Conventional commits, no emojis, no co-author attributions:
`feat: add user enrollment validation` | `fix: resolve token expiry` | `refactor: simplify pagination`

## Adding New Features (Full-Stack Checklist)

1. DB schema in `api/src/database/schema/index.ts`, then `bun run db:generate`.
2. Types in `api/src/types/`.
3. Zod schemas in `api/src/schemas/{entity}Schemas.ts`.
4. Repository: `api/src/repositories/{entity}Repository.ts` (class + singleton).
5. Service: `api/src/services/{entity}Service.ts` (class + singleton).
6. Controller: `api/src/controllers/{entity}Controller.ts` (named arrow functions).
7. Route: `api/src/routes/{entity}Routes.ts` with middleware chain.
8. Frontend service: `web/src/services/{entity}.service.ts` (class + singleton).
9. Query hooks: `web/src/hooks/queries/use{Entity}.ts` with key factory.
10. UI: Build pages/components using existing shadcn/ui components from `web/src/components/ui/`.
11. Run `typecheck` and `lint` in both `api/` and `web/`.

## Key Reminders

- Search existing code before creating new utilities, components, or hooks.
- Reuse existing patterns: shadcn/ui components, response helpers, error handlers, query key factories.
- Make surgical edits -- do not rewrite entire files.
- Implement features end-to-end across the full stack; do not leave partial implementations.
- Environment variables: API uses `.env`, web uses `.env.local`. Never commit these files.