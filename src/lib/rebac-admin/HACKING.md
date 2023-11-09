# Developing Canonical ReBAC Admin

#### In this document:

- [Development setup](#development-setup)
- [Testing in host projects](#testing-in-host-projects)
  - [Install from repo](#install-from-repo)
  - [Local link](#local-link)
- [Testing private repository access](#testing-private-repository-access)
- [Download openapi.yaml](#download-openapiyaml)
- [Build API files](#build-api-files)
- [Codebase and development guidelines](#codebase-and-development-guidelines)
  - [React](#react)
    - [Components](#components)
    - [Demo files](#demo-files)
      - [Demo service](#demo-service)
    - [Package files](#package-files)
      - [Common files](#common-files)
      - [Views](#views)
      - [SCSS](#scss)
  - [React Query](#react-query)
  - [TypeScript](#typescript)
  - [Testing](#testing)
    - [Test factories](#test-factories)
  - [External libraries](#external-libraries)
    - [Vanilla Framework](#vanilla-framework)
    - [Vanilla React Components](#vanilla-react-components)

## Development setup

To develop ReBAC Admin you will need to do the following steps:

1. Install Yarn.
2. Fetch this repo.
3. Run `yarn install`.
4. Now you can run the project with `yarn start`.

## Testing in host projects

To test ReBAC Admin in a host project you can either use a repo/branch directory
from GitHub, or to develop locally you can use `yarn link`.

### Install from repo

To install from a GitHub repo make sure you [have private repository
access](#testing-private-repository-access). Now you can add the package with:

```bash
yarn add @canonical/rebac-admin@git+ssh://git@github.com:<username>/rebac-admin.git#<branch>
```

Or if the project already uses rebac-admin you can change the line in
package.json:

```bash
"@canonical/rebac-admin": "git+ssh://git@github.com:<username>/rebac-admin.git#<branch>",
```

### Local link

To use a local link, first make sure this project is set up by
running the following commands inside the rebac-admin repo:

```bash
yarn install
yarn build # or yarn build --watch if you want this project to update as you make changes.
```

Now, inside your host project run:

```bash
yarn link ~/path/to/rebac-admin --private
```

To prevent multiple copies of React being loaded and type conflicts, open
your host's package.json and link to the modules inside the rebac-admin repo:

```json
  "resolutions": {
    "@canonical/rebac-admin": "portal:/absolute/path/to/rebac-admin",
    "react": "portal:/absolute/path/to/rebac-admin/node_modules/react",
    "react-dom": "portal:/absolute/path/to/rebac-admin/node_modules/react-dom",
    "react-router-dom": "portal:/absolute/path/to/rebac-admin/node_modules/react-router-dom",
    "@types/react": "portal:/absolute/path/to/rebac-admin/node_modules/@types/react",
    "@types/react-dom": "portal:/absolute/path/to/rebac-admin/node_modules/@types/react-dom"
  }
```

Finally run:

```bash
yarn install
```

Then you should be able to run your project as normal.

When you're finished you can clean up the links by running the following in your
host project:

```bash
yarn unlink --all
```

## Testing private repository access

To be able to install from a private GitHub repository make sure you have
[ssh keys for GitHub set up](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)
on the machine or container you're using to install the
package. You can test this with:

```bash
git ls-remote git@github.com:canonical/rebac-admin.git
```

If successful you should see a list of refs.

## Download openapi.yaml

Before starting, make sure that the following environment variables are setup
correctly either in `.env` or in `.env.local`:

- `API_SPEC_VERSION`: represents the version of the `openapi.yaml` spec file
  to download. If not provided, it defaults to `main` and the spec file from the
  `main` branch of
  [Openfga Admin Openapi Spec](https://github.com/canonical/openfga-admin-openapi-spec/tree/main)
  will be downloaded.
- `GITHUB_ACCESS_TOKEN`: represents the valid GitHub Personal Access Token with
  read access to the
  [Openfga Admin Openapi Spec](https://github.com/canonical/openfga-admin-openapi-spec/)
  repository. For instance, you can provide a
  [personal access token (classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic)
  with "full control of private repositories" scope. You are required to provide
  this token either as an environment variable or as the sole argument for the
  command mentioned below.

Once the environment variables are set up correctly, to fetch the specified
version of `openapi.yaml` spec file, run:

```bash
yarn fetch-api-spec
```

In case the GitHub Access Token isn't defined as an environment variable and/or
you want to override the GitHub Access Token defined as an environment variable,
run:

```bash
yarn fetch-api-spec INSERT_ACCESS_TOKEN
```

Replace `INSERT_ACCESS_TOKEN` with your valid GitHub Personal Access Token.

_Note: If defined in both files, environment variables defined in `.env.local`
will be given priority over those defined in `.env`._

## Build API files

To build the API files using Orval, run:

```bash
yarn build-api
```

Once the script runs succesfully, the built API files can be found in `src/api`.

_Note: The API files are built from the `openapi.yaml` spec file. In case the
spec file is not present in the root of the repository, the above command will
first try to download it using the procedure described in
[Download openapi.yaml](#download-openapiyaml)._

## Codebase and development guidelines

### React

ReBAC Admin uses [React](https://react.dev/) for its component based UI. The
[Redux dev tools](https://github.com/reduxjs/redux-devtools) extension can be useful
during development.

#### Components

This project uses [function
components](https://react.dev/learn/your-first-component#defining-a-component)
and [hooks](https://react.dev/reference/react) over class based components.

It is recommended to have one component per file, and one component per
directory. A typical component directory will have the structure:

- `_component.scss` (any SCSS specific to this component)
- `Component.tsx` (the component itself)
- `Component.test.tsx` (tests specific to this component)
- `index.tsx` (export the component from this file)

#### Demo files

The `demo` folder contains an example application layout that displays the ReBAC
Admin. This can be used in development to view the admin in context and is
displayed by running `yarn start`.

All files in the `demo` folder are for development only and are not included in
the built package.

##### Demo service

The `demo` app is deployed to the Canonical web team's demo service when a PR is
created on GitHub. The demo build is configured in `vite-demo.config.ts`.

#### Package files

The package source is contained in `src` and its contents are built for the
rebac-admin package using Vite's library mode.

Components and modules that are exposed by the module should be exported in `src/index.ts`.

##### Common files

Where possible write reusable code which should live in the top level
directories e.g. `src/components`, `src/hooks`, `src/utils`.

##### Views

Distinct views of the app live in the `src/views` directory. These will usually equate to the
top level routes.

##### SCSS

Shared SCSS should live in the `src/scss` directory, but SCSS specific to a page
or component should live in the component's directory and be imported inside the
component.

### React Query

ReBAC Admin uses [React Query](https://tanstack.com/query/latest) to communicate
with the API.

Each query has a hook that has been built from the API definition and can be
found in the `src/api` sub-directories.

### TypeScript

ReBAC Admin is written in TypeScript. Wherever possible strict TypeScript
should be used.

### Testing

The admin is unit tested and interaction tested using [Vitest](https://vitest.dev/) and [React
Testing Library](https://testing-library.com/).

#### Test factories

The admin uses [Faker](https://fakerjs.dev/) test factories instead of data dumps to allow each test to
declare the data required for it to pass.

Test factories are generated from the API definition and can be found in the
`.msw.ts` files in the `src/api` sub-directories.

### External libraries

ReBAC Admin makes use of a few external libraries that are built and
maintained by Canonical.

#### Vanilla Framework

[Vanilla
Framework](https://github.com/canonical/vanilla-framework) is a CSS framework
used to provide consistency across Canonical's codebases.

#### Vanilla React Components

[Vanilla React
Components](https://github.com/canonical/react-components) is a React
implementation of Vanilla Framework and is the preferred method of consuming
Vanilla Framework elements.
