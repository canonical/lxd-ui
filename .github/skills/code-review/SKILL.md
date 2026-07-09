---
name: code-review
description: "Review a GitHub PR for the LXD-UI codebase. Checks code quality, security, and adherence to LXD-UI conventions including TypeScript, React, React Query, side panel patterns, notifications, and OWASP Top 10. For GitHub Copilot code review and VS Code Copilot Chat. Triggers on: code review, review, PR review, code quality, security review."
---

# LXD-UI Code Review

Perform a thorough, actionable review of a GitHub PR for the LXD-UI project.

## Setup

Reference the project conventions before reviewing:

- [agents.md](../../../agents.md) — LXD-UI conventions, patterns, and architecture
- [.github/copilot-instructions.md](../../copilot-instructions.md) — Code review standards

## Review Criteria

When reviewing code, check each file against these criteria:

### TypeScript Quality

- No `any` types unless explicitly justified
- All component props are typed via an `interface Props` or `interface ComponentProps`
- Strict null checks respected — no unchecked optional chaining without guards
- Path aliases used for imports (e.g. `context/...`, `api/...`, `util/...`)

### React Patterns

- Functional components only (no class components)
- Hooks used correctly (no conditional hook calls, deps arrays correct)
- Components declared as `const Component: FC = () => { ... }`
- Side effects in `useEffect`, not in render
- No JSX in conditional ternaries without parentheses

### Data Fetching (React Query)

- Query keys follow the hierarchical pattern in [src/util/queryKeys.tsx](../../../src/util/queryKeys.tsx)
- Mutations invalidate relevant query keys on success
- `useQuery` / `useMutation` used consistently — no raw `useEffect` for data fetching
- Cache invalidation handled on mutations

### Side Panel Pattern

- New panels added to the `panels` constant in [src/util/usePanelParams.tsx](../../../src/util/usePanelParams.tsx)
- `open*` helper added to `PanelHelper` interface and implementation
- Panel renders `<NotificationRow />` and calls `notify.clear()` on close
- Parent page suppresses `<NotificationRow />` when any panel is open

### Notification Pattern

- `useNotify` used for inline panel/form errors
- `useToastNotification` used for post-action feedback
- `notify.clear()` called when panels close
- No multiple notification systems in same component

### API Layer

- API calls stay in [src/api/<resource>.tsx](../../../src/api/)
- Naming convention: `fetch<Resource>s()`, `create<Resource>()`, `update<Resource>()`, `delete<Resource>()`
- `fetch` used with proper error handling
- Query parameters and payloads documented

### Security (OWASP Top 10)

- No user-supplied values interpolated directly into `dangerouslySetInnerHTML`
- No secrets, tokens, or credentials in source or comments
- No unvalidated data passed to `eval()` or similar
- API calls use typed responses — no blind `JSON.parse` of arbitrary input
- Input validation before API calls

### Tests

- New features include at least one E2E test in [tests/](../../../tests/)
- New utility functions include a unit test (`.spec.ts` colocated with the source)
- Helpers used from [tests/helpers/](../../../tests/helpers/) rather than duplicated inline
- Aim for 80%+ coverage on critical logic

### Code Quality

- No circular imports introduced (`yarn check-circular-deps` would pass)
- No commented-out code or debug `console.log` statements
- SCSS follows BEM convention; `@canonical/react-components` preferred over custom styles
- File names: PascalCase for components, camelCase for utilities
- Components are modular and reusable; avoid large monolithic files
- Comments explain _why_, not _what_

### Component Organization

- Related components are colocated
- Reusable components in `src/components/`, page-specific in `src/pages/`

## Review Output Format

Structure reviews as:

```
## Review: PR #<number> — <title>

### Summary
<2-3 sentence overview of what the PR does and overall impression>

### Critical Issues
<Numbered list — these must be fixed before merging>

### Minor Issues / Suggestions
<Numbered list — improvements that are encouraged but not blocking>

### Positives
<Brief callout of things done well>
```

Always explicitly state: "No critical issues" if none exist.
