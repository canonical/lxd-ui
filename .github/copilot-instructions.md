# LXD-UI Code Review & Development Instructions

This file configures GitHub Copilot's behavior for code reviews and development tasks in the LXD-UI repository.

## Code Review Standards

When reviewing pull requests, apply these LXD-UI-specific checks:

### TypeScript & Type Safety

- Verify TypeScript strict mode compliance (`tsconfig.json`)
- All function parameters and returns must be explicitly typed
- No `any` types unless absolutely necessary with justification
- Component props must be typed via `interface Props` or inline

### React Components & Patterns

- Use **functional components** (no class components)
- Props must be properly typed: `interface ComponentProps { ... }`
- Use React hooks for state and effects
- Follow the side panel pattern for create/edit forms (see [`agents.md`](../agents.md))

### React Query & Data Fetching

- Queries use `useQuery` with typed `queryFn`
- Mutations use `useMutation` with proper error handling
- Cache invalidation on mutations (via `useQueryClient`)
- Query keys follow hierarchical pattern (defined in `queryKeys.tsx`)
- No polling; use proper cache strategies

### Notification System

- **Inline errors**: Use `useNotify` with `<NotificationRow />`
- **Toast notifications**: Use `useToastNotification` for post-action feedback
- Always clear inline notifications when closing panels

### API Layer

- Keep API calls in `src/api/<resource>.tsx`
- Follow naming: `fetch<Resource>s()`, `create<Resource>()`, etc.
- Include query params documentation

### Component Organization

- Colocate related components
- Use `.spec.ts` (or `.spec.tsx` when JSX is needed) for Vitest unit tests (Playwright E2E tests live under `tests/` as `.spec.ts`)
- Keep components modular and reusable; avoid large monolithic components

### Testing

- Unit tests with Vitest for utilities and complex logic
- E2E tests with Playwright for user workflows
- Use test helpers from `tests/helpers/`

### Security

- No hardcoded secrets or API keys
- Validate user inputs before API calls
- Sanitize rendered HTML (use React's default escaping)
- Check OWASP Top 10 for common vulnerabilities

### Code Quality

- Run `yarn lint-js` before commit (TypeScript, ESLint, Prettier)
- No circular dependencies (check with `yarn check-circular-deps`)
- Use path aliases from `tsconfig.json` (`context/`, `api/`, etc.)
- Comments explain _why_, not _what_

## LXD-UI Project Reference

See these files for detailed conventions:

- [`agents.md`](../agents.md) — Complete project patterns and architecture
- [`AGENTS_AND_SKILLS.md`](AGENTS_AND_SKILLS.md) — Agent and skill usage guide
- `ARCHITECTURE.MD` — System architecture and setup

## For Development Tasks

When suggesting code or refactoring:

- Follow patterns in `src/` (API → Context → Components → Pages)
- Reference similar features (e.g., instances, networks) as templates
- Include test suggestions
- Validate with `yarn lint-js` requirements
