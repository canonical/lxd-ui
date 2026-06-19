# LXD-UI Agent Guidelines

This document provides guidance for AI agents working with the LXD-UI codebase.

## Project Overview

**LXD-UI** is a browser-based frontend for LXD. It enables easy management of containers and virtual machines for private clouds at any scale.

- **Language**: TypeScript + React
- **Build Tool**: Vite
- **Package Manager**: Yarn
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Code Quality**: ESLint, Prettier, StyleLint
- **License**: LGPL-3.0-only

## Technology Stack

- **React**: UI framework
- **React Router DOM**: Client-side routing
- **TanStack React Query**: Data fetching and caching
- **Formik**: Form state management
- **Canonical React Components**: Canonical design system
- **CodeMirror**: In-browser code editor
- **XTerm**: Terminal emulation
- **Axios**: HTTP client for API communication
- **TypeScript**: Type-safe JavaScript

Exact dependency versions are maintained in `package.json` and lockfiles.

## Project Structure

```
lxd-ui/
+-- src/                          # Main source code
|   +-- App.tsx                   # App routing and layout
|   +-- Root.tsx                  # Root component with providers
|   +-- index.tsx                 # Entry point
|   +-- Events.tsx                # Event subscriptions and listeners
|   +-- api/                      # API calls and queries
|   |   +-- *.tsx                 # Resource-specific API files (instances.tsx, networks.tsx, etc.)
|   +-- components/               # Reusable React components
|   |   +-- forms/                # Form components
|   +-- context/                  # React Context providers and custom hooks
|   |   +-- appProviders.tsx      # Main app context provider setup
|   |   +-- auth.tsx              # Authentication context
|   |   +-- use*.tsx              # Custom hooks for various features
|   +-- lib/                      # Utility libraries (e.g., spice client)
|   +-- pages/                    # Page components organized by feature
|   |   +-- instances/
|   |   +-- networks/
|   |   +-- storage/
|   |   +-- ...
|   +-- sass/                     # SCSS stylesheets
|   +-- types/                    # TypeScript type definitions
|   +-- util/                     # Utility functions
+-- tests/                        # End-to-end tests
|   +-- *.spec.ts                 # Test files using Playwright
|   +-- fixtures/                 # Test fixtures and setup
|   +-- helpers/                  # Test helper functions
|   +-- scripts/                  # Test setup/teardown scripts
+-- public/                       # Static assets
+-- keys/                         # SSL certificates (generated during setup)
+-- package.json                  # Dependencies and build/test scripts
+-- vite.config.ts                # Vite build configuration
+-- vitest.config.ts              # Vitest unit test configuration
+-- playwright.config.ts          # Playwright E2E test configuration
+-- tsconfig.json                 # TypeScript configuration with path aliases
+-- eslint.config.mjs             # ESLint configuration
+-- ARCHITECTURE.MD               # Architecture and setup documentation
+-- CONTRIBUTING.md               # Contribution guidelines

```

## Path Aliases

TypeScript paths are aliased in `tsconfig.json` for cleaner imports:

```typescript
import { useInstances } from "context/useInstances"; // src/context/useInstances.tsx
import DocLink from "components/DocLink"; // src/components/DocLink.tsx
import { fetchInstances } from "api/instances"; // src/api/instances.tsx
import { queryKeys } from "util/queryKeys"; // src/util/queryKeys.tsx
import type { LxdInstance } from "types/instance"; // src/types/instance.d.ts
import usePanelParams from "util/usePanelParams"; // src/util/usePanelParams.tsx
```

## Key Directories and Their Purpose

### `/src/api`

- **Purpose**: Contains all API calls to the LXD backend
- **Pattern**: Each resource has a dedicated file (instances.tsx, networks.tsx, etc.)
- **Usage**: Wrapped with React Query for caching and state management
- **Pattern**: Files contain functions like `fetchInstances()`, `createInstance()`, `deleteInstance()`

### `/src/components`

- **Purpose**: Reusable UI components following Canonical design system
- **Subdirectory `/src/components/forms`**: Form components for data entry
- **Pattern**: Each component is a .tsx file with optional .scss file for styling
- **Note**: Imports from `@canonical/react-components` for design consistency

### `/src/context`

- **Purpose**: React Context for global state and custom hooks
- **Naming Convention**: Hooks are named `use*` (e.g., `useInstances`, `useNetworks`)
- **Query Integration**: Most hooks integrate with React Query for server state
- **App Initialization**: `appProviders.tsx` sets up all providers including auth, routing, React Query
- **Feature Hooks**: One hook per major feature, usually containing:
  - React Query hooks for data fetching
  - Local state management
  - Derived data calculations

### `/src/pages`

- **Purpose**: Page/feature components organized by resource type
- **Structure**: Each feature has a subdirectory with multiple views (list, detail, form, etc.)
- **Pattern**: Pages use components and context hooks to build complete features
- **Routing**: Integrated via React Router DOM in App.tsx

### `/src/types`

- **Purpose**: Shared TypeScript type definitions
- **Pattern**: One file per resource type (e.g., `instance.d.ts`, `network.d.ts`, `storage.d.ts`)
- **API Contract**: Types reflect the LXD API response structure

### `/src/util`

- **Purpose**: Pure utility functions
- **Examples**: Formatting, validation, data transformation, string manipulation
- **Testing**: These functions should have unit tests

### `/src/sass`

- **Purpose**: Global and component-specific styling
- **File**: `_settings.scss` contains SCSS variables shared with Canonical React Components

## Development Setup

### Prerequisites

1. **LXD Server**: Running locally or remotely
   - Linux: `snap install lxd && lxd init`
   - Mac: Use Multipass for remote LXD instance
2. **Workshop**: `snap install workshop --classic`
3. **Node.js/Yarn**: For dependency management

### Initial Setup

```bash
# 1. Install dependencies
# If using workshop:
workshop run dev install

# Or without workshop:
yarn install

# 2. Optional: create local overrides file
cp .env .env.local

# 3. Optional: if using a remote LXD backend (for example Mac + Multipass or running LXD inside another LXD instance), set backend IP override
echo "LXD_UI_BACKEND_IP=<backend-ip>" >> .env.local
```

### Running Development Server

```bash
# Start dev server with HaProxy forwarding
workshop run dev serve

# First run generates certificates in keys/. Trust the generated cert with LXD.
sudo lxc auth identity create tls/workshop-cert keys/lxd-ui.crt --group admins

# Or without workshop
yarn start


# Access at: https://localhost:8407/
```

**Note**: First run generates SSL certificates in `keys/` directory. HaProxy proxies both:

- UI requests to Vite dev server
- API requests to LXD backend (configurable via LXD_UI_BACKEND_IP in .env.local)

## Build and Run Commands

### Development

```bash
workshop run dev serve        # Start dev server (recommended)
yarn start                    # Alternative: start dev server without workshop
```

### Building

```bash
yarn build                   # Full build: vite build + asset fixes + HTML
yarn build-html              # Copy built index.html
```

### Linting and Formatting

```bash
yarn lint-js                 # TypeScript type check + ESLint + Prettier check
yarn lint-scss               # SCSS linting
yarn format-js               # Fix ESLint + Prettier issues
yarn format-js-eslint        # Fix ESLint issues only
yarn format-js-prettier      # Fix Prettier issues only
```

### Code Quality

```bash
yarn check-circular-deps     # Check for circular dependency issues
```

### Command Selection Rules

- Prefer `workshop run dev ...` commands when Workshop is available.
- If Workshop is unavailable, use the equivalent `yarn ...` command.
- In setup and run instructions, show Workshop first and Yarn fallback second.

## Testing

### Unit and Integration Tests

```bash
yarn test-js                 # Run unit tests once with Vitest
yarn test-js-coverage        # Generate coverage report
```

**Location**: Tests are colocated with source code as `.spec.ts` files
**Framework**: Vitest with similar syntax to Jest
**Note**: Use `describe()`, `test()`, and standard assertions

### E2E Tests

```bash
yarn test-e2e-edge           # Test against latest LXD
yarn test-e2e-5.21-edge      # Test against LXD 5.21
yarn test-e2e-5.0-edge       # Test against LXD 5.0

yarn test-e2e-coverage       # Collect E2E coverage
yarn test-e2e-cluster-coverage # Clustered setup coverage
```

**Location**: `/tests/*.spec.ts`
**Framework**: Playwright with fixtures
**Fixture Setup**: `tests/fixtures/lxd-test.ts` provides LXD-specific test utilities
**Browser Coverage**: Tests run against Chromium and Firefox
**LXD Versions**: Automated matrix testing via GitHub Actions

#### Playwright Projects

Project names are defined in `playwright.config.ts` and generally follow this pattern:

```text
<browser>:lxd-<version>:<deployment>
```

Examples:

- `chromium:lxd-latest-edge:unclustered`
- `firefox:lxd-5.21-edge:clustered`
- `chromium:lxd-latest-edge:single-node-cluster`

Run a specific project:

```bash
npx playwright test --project "chromium:lxd-latest-edge:unclustered"
```

Run one test file against a specific project:

```bash
npx playwright test tests/instances.spec.ts --project "firefox:lxd-5.21-edge:unclustered"
```

Special projects used in this repo:

- `login-chromium`, `login-firefox`: login-only project setup
- `coverage`, `coverage:cluster-enable`, `coverage:clustered`: browser coverage runs
- `screenshots`, `screenshots-clustered`: docs screenshot generation

## Code Conventions

### TypeScript

- **Type Annotations**: Always explicitly type component props and function returns
- **No `any` Type**: Avoid `any` unless absolutely necessary
- **Path Aliases**: Use configured aliases for imports (see Path Aliases section)
- **Type Safety**: Enable strict mode checks

### React Components

- **Functional Components**: Use function components (avoid class components). Most components are declared as `const Component: FC = () => { ... }`;
- **Props Interface**: Define props as `interface Props { ... }` if they are only used locally, or `interface ComponentProps` if needed in other files.
- **Hooks**: Use React hooks for state and effects
- **File Naming**: PascalCase for components (e.g., `InstanceList.tsx`)

### Styling

- **SCSS**: Use SCSS for component-specific styles
- **BEM Convention**: Block Element Modifier for class naming
- **Canonical Components**: Prefer `@canonical/react-components` over custom styles
- **Theme Variables**: Use `_settings.scss` variables for consistency

### File Organization

- **Colocation**: Keep related files together (page + local components and utility functions + tests)
- **No Circular Imports**: Check with `yarn check-circular-deps`

### Naming Conventions

- **Components**: PascalCase (e.g., `InstancePanel.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Context Hooks**: `use*` pattern (e.g., `useInstances.tsx`)
- **Types**: Match resource name (e.g., `types/instance.d.ts`)
- **API Functions**: Verb + Resource (e.g., `fetchInstances()`, `createNetwork()`)

## API and Data Fetching Patterns

### React Query Integration

- **Query Keys**: Organized hierarchically to maintain cache coherence
- **Queries**: Fetch operations use `useQuery` or `useQueries`
- **Mutations**: Mutations use `useMutation` for create/update/delete
- **Automatic Refetching**: Query cache invalidation on mutations

### Example Pattern

```typescript
// In context/useInstances.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchInstances, createInstance } from "api/instances";

export const useInstances = (projectName: string) => {
  return useQuery({
    queryKey: ["instances", projectName],
    queryFn: () => fetchInstances(projectName),
  });
};

export const useCreateInstance = (projectName: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createInstance(projectName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instances", projectName],
      });
    },
  });
};
```

### Query Key Conventions

Base keys are defined in `/src/util/queryKeys.tsx`. Actual query key composition example from `/src/context/useInstances.tsx`:

```typescript
return useQuery({
  queryKey: [queryKeys.instances, project],
  queryFn: async () =>
    fetchInstances(project, isFineGrained, hasInstanceStateSelectiveRecursion),
});

return useQuery({
  queryKey: [queryKeys.instances, name, project],
  queryFn: async () =>
    fetchInstance(
      name,
      project,
      isFineGrained,
      hasInstanceStateSelectiveRecursion,
    ),
});
```

## Common Code Patterns

### Using Forms

- **Formik Integration**: Most forms use Formik for state management
- **Components**: `FormEditButton`, `ScrollableForm` provide consistent UX
- **Validation**: Yup or manual validation functions
- **Error Handling**: Display errors inline with form fields

### Modals and Dialogs

- **Pattern**: Use context or state to control modal visibility
- **Link Propagation**: Careful handling to avoid breaking browser navigation

### Tooltips and Positioning

- **Component**: Canonical `Tooltip` component
- **Dynamic Positioning**: Adjust position based on viewport space

### Side Panel Pattern

Side panels are slide-in panels used for create/edit forms and detail views. They are driven by URL search params via `usePanelParams`.

#### Key files

- `src/util/usePanelParams.tsx` — defines all panel names (`panels` constant) and the `PanelHelper` interface with open/close helpers
- `src/pages/*/panels/` — panel component files, one per use case

#### Opening a panel

Call a typed helper from `usePanelParams` to set the relevant URL search params:

```typescript
const panelParams = usePanelParams();
panelParams.openCreateImageRegistry(); // create panel (no args)
panelParams.openEditImageRegistry("my-reg"); // edit panel (resource id)
```

In the parent page, conditionally render the panel based on `panelParams.panel`:

```tsx
{
  panelParams.panel === panels.createImageRegistry && (
    <CreateImageRegistryPanel />
  );
}
{
  panelParams.panel === panels.editImageRegistry && <EditImageRegistryPanel />;
}
```

#### Panel component structure

```tsx
import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import NotificationRow from "components/NotificationRow";

const CreateFooPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();

  const closePanel = () => {
    panelParams.clear(); // clear URL params
    notify.clear(); // dismiss inline error
  };

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create foo</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            {/* form content */}
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer id="panel-footer">
          <Button onClick={closePanel}>Cancel</Button>
          <ActionButton
            onClick={() => formik.submitForm()}
            loading={formik.isSubmitting}
          >
            Create
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};
```

#### Adding a new panel

1. Add an entry to the `panels` constant in `usePanelParams.tsx`
2. Add the corresponding `open*` method to the `PanelHelper` interface and implementation
3. Create the panel component under `src/pages/<feature>/panels/`
4. Render it conditionally in the parent page component
5. Suppress the `<NotificationRow />` on the page when any panel is open: `{!panelParams.panel && <NotificationRow />}`

### Notifications

There are two distinct notification systems in LXD-UI, both from `@canonical/react-components`:

#### 1. `useNotify` — Inline page/panel notifications

Used for errors and contextual messages displayed inline within the current view (e.g., inside a form or panel).

```typescript
import { useNotify } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";

const MyComponent: FC = () => {
  const notify = useNotify();

  const handleAction = () => {
    doSomething()
      .catch((e) => notify.failure("Action failed", e));
  };

  return (
    <>
      <NotificationRow />  {/* renders the inline notification */}
      ...
    </>
  );
};
```

- `notify.failure(title, error)` — shows an error notification inline
- `notify.clear()` — clears the notification (call when closing a panel)
- `<NotificationRow />` — wrapper around `<NotificationConsumer />` that renders the current notification; place it at the top of forms/panels
- Provided by `<NotificationProvider>` in `appProviders.tsx`; the notification clears automatically on route change

#### 2. `useToastNotification` — Toast (status bar) notifications

Used for success/failure messages after completing an action, shown in the status bar at the bottom of the screen. These persist across navigation and are listed in the notification history.

```typescript
import { useToastNotification } from "@canonical/react-components";

const MyComponent: FC = () => {
  const toastNotify = useToastNotification();

  const handleSuccess = (name: string) => {
    toastNotify.success(<>Resource <strong>{name}</strong> created.</>);
  };

  const handleFailure = (e: Error) => {
    toastNotify.failure("Resource creation failed.", e);
  };
};
```

- `toastNotify.success(message, actions?)` — green success toast
- `toastNotify.failure(title, error, link?)` — red failure toast
- `toastNotify.info(message)` — informational toast
- Provided by `<ToastNotificationProvider>` in `appProviders.tsx`
- Visible in the `StatusBar` component; users can expand the notification list

#### Usage convention

- Use `useNotify` for **form/panel-level errors** (e.g., API call failed while the panel is open).
- Use `useToastNotification` for **post-action feedback** after closing a panel or completing an async operation.
- When closing a panel, always call `notify.clear()` to dismiss any inline error.

## Common Tasks

### Adding a New Feature/Resource

> **Note:** Replace `resource` in the paths below with your actual feature/resource name (e.g., `instances`, `networks`, `storage`, `image-registries`).

1. **Create Types**: Define LXD API types in `src/types/resource.ts`
2. **Create API Layer**: Add fetch/create/update/delete functions in `src/api/resource.tsx`
3. **Create Hook**: Add React Query integration in `src/context/useResource.tsx`
4. **Create Components**: Build common UI components in `src/components/`
5. **Create Pages**: Add feature pages and local components in `src/pages/resource/`
6. **Add Tests**: Include unit tests for utilities and E2E tests for workflows

### Debugging

1. **Browser DevTools**: Open Chrome DevTools with F12
2. **React DevTools**: Check component props and state
3. **Network Tab**: Inspect LXD API calls
4. **Console Logs**: Add temporary logging (remove before committing)
5. **E2E Test Debugging**: Use Playwright Inspector: `npx playwright test --debug`

### Running Specific Tests

```bash
# Unit test for specific file
yarn test-js -- src/util/seconds.spec.ts

# E2E test for specific feature
npx playwright test tests/instances.spec.ts

# E2E test with specific browser and deployment
npx playwright test tests/instances.spec.ts --project chromium:lxd-latest-edge:unclustered
```

## Important Files to Know

| File                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `src/App.tsx`                  | Main routing and layout component     |
| `src/Root.tsx`                 | Root component wrapping all providers |
| `src/Events.tsx`               | WebSocket event subscriptions         |
| `src/api/instances.tsx`        | LXD instances API calls               |
| `src/context/appProviders.tsx` | Setup of all global providers         |
| `src/context/useInstances.tsx` | Instance state and queries            |
| `tsconfig.json`                | TypeScript paths and compiler options |
| `vite.config.ts`               | Build configuration                   |
| `vitest.config.ts`             | Unit test configuration               |
| `playwright.config.ts`         | E2E test configuration                |
| `ARCHITECTURE.MD`              | System architecture and dev setup     |
| `CONTRIBUTING.md`              | Contribution process                  |

## GitHub Actions and CI/CD

### Automated on Pull Requests

- **PR Checks Workflow**: `.github/workflows/pr.yaml`
  - Type checking with TypeScript
  - Linting (ESLint, Prettier, StyleLint)
  - Unit tests (Vitest)
  - E2E tests (Playwright) against multiple LXD versions and browsers
  - Circular dependency check

### Matrix E2E Testing

Tests run against:

- LXD Versions: 5.0/edge, 5.21/edge, latest/edge
- Browsers: Chromium, Firefox

### Demo Deployment

- Webhook triggers demo build for PRs from collaborators
- Deployed to demo.haus Kubernetes cluster
- Updated automatically on merges to main

## Tips for Working with LXD-UI

1. **Environment Variables**: Use `.env.local` to override defaults without affecting repository
2. **Certificate Trust**: First-time setup requires trusting the workshop certificate with LXD
3. **Backend Switching**: Change `LXD_UI_BACKEND_IP` to test against different LXD instances
4. **Circular Dependencies**: Monitor with `yarn check-circular-deps` during refactoring
5. **React Query DevTools**: Consider enabling React Query DevTools in development for debugging
6. **Component Library**: Leverage `@canonical/react-components` before creating custom components
7. **Types Checking**: Run `tsc --noEmit` before committing to catch type errors
8. **Performance**: Use React DevTools Profiler to identify rendering performance issues
9. **API Documentation**: Refer to LXD API docs for available endpoints and response structures
10. **Test Coverage**: Aim for high coverage on utility functions and complex components

## Safety Notes

- Never commit secrets, credentials, or private keys.
- Keep machine-specific overrides in `.env.local` (already gitignored).
- Do not commit generated certificate or key artifacts from local setup.

## Definition of Done (Agent Changes)

1. Use real feature/resource names in paths and symbols (do not leave placeholder `resource` values in generated code).
2. Run relevant validation before finalizing changes:

- `yarn lint-js` for type/lint/format checks.
- Targeted tests for touched areas (unit and/or E2E as appropriate).

3. Confirm commands in guidance are runnable for this repository (including full Playwright project names when `--project` is used).
4. Keep changes scoped and consistent with existing patterns in `src/api`, `src/context`, `src/pages`, and `src/types`.

## Quick Reference: Key Scripts

```bash
# Development
workshop run dev serve        # Start dev server (recommended)
yarn start                    # Alternative: start dev server without workshop

yarn build                    # Production build

# Code Quality
yarn lint-js                  # Full linting check
yarn format-js                # Format all code

# Testing
yarn test-js                  # Unit tests
yarn test-e2e-edge            # E2E tests (latest LXD)

# Utilities
yarn check-circular-deps      # Detect circular imports
yarn clean                    # Clean build artifacts
```

## Additional Resources

- [LXD Documentation](https://documentation.ubuntu.com/lxd/en/latest/) — Comprehensive LXD user and administrator guide
- [LXD API Specification](https://documentation.ubuntu.com/lxd/en/latest/api/) — Complete LXD REST API documentation
- [Architecture Deep Dive](ARCHITECTURE.MD)
- [Contributing Guide](CONTRIBUTING.md)
- [GitHub Repository](https://github.com/canonical/lxd-ui)
- [Canonical Design System](https://github.com/canonical/react-components)
- [Vite Documentation](https://vitejs.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Playwright Testing](https://playwright.dev/)
