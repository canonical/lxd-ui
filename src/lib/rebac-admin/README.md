# Canonical ReBAC Admin

This is a shared UI for managing ReBAC permissions.

- [Install](#install)
- [Displaying the component](#displaying-the-component)
- [Config](#config)
- [Navigation](#navigation)
- [Limiting access](#limiting-access)

## Install

First, make sure you have [ssh keys for GitHub set up](HACKING.md#testing-private-repository-access).

Now you can add the rebac-admin package with:

```bash
yarn add @canonical/rebac-admin@git+ssh://git@github.com:canonical/rebac-admin.git
```

You will also need the following peer dependencies if you don't have them already:

```bash
yarn add @canonical/react-components @types/react @types/react-dom react react-dom vanilla-framework react-router-dom
```

## Displaying the component

The ReBAC admin is displayed using a single component. This component will
handle routing based on the URL it is displayed at. If using react-router
then this route should end with `/*` so that the admin component can receive
child routes.

```jsx
import { ReBACAdmin } from "@canonical/rebac-admin";
import { Route, Routes } from "react-router-dom";

const App = (): JSX.Element => (
  <Routes>
    ...
    <Route
      path="/permissions/*"
      element={<ReBACAdmin apiURL="http://example.com/api" />}
    />
    ...
  </Routes>
);
```

If the host project is not using React Router then the `ReBACAdmin` component
will need to be wrapped in a router, with `basename` set to the path that the
admin component is displayed at.

```jsx
import { ReBACAdmin } from "@canonical/rebac-admin";
import { BrowserRouter } from "react-router-dom";

const Permissions = (): JSX.Element => (
  <BrowserRouter basename="/permissions">
    <ReBACAdmin apiURL="http://example.com/api" />
  </BrowserRouter>
);

```

## Config

The following props can be provided to the `ReBACAdmin` component to configure the admin.

| Prop   | Description                                                                          | Examples                       |
| :----- | :----------------------------------------------------------------------------------- | :----------------------------- |
| apiURL | The absolute URL of the ReBAC API, including domain if the API is hosted externally. | http://example.com/api/, /api/ |

## Navigation

Links to each subsection of the ReBAC admin will need to be displayed within
the host app's navigation.

The rebac-admin package exposes an object of urls. This object contains not only
the top level URLs, but also the subsections should you wish to provide deep
links to the Admin.

The top level links wrap a `NavLink` component from React Router and require a
`baseURL` prop that should be set to the location that the `ReBACAdmin`
component is rendered at.

```jsx
import {
  AccessGovernanceLink,
  AuthenticationLink,
  EntitlementsLink,
  GroupsLink,
  ResourcesLink,
  RolesLink,
  UsersLink,
} from "@canonical/rebac-admin";

const Nav = (): JSX.Element => (
  <>
    <AccessGovernanceLink baseURL="/permissions" />
    <AuthenticationLink baseURL="/permissions" />
    <EntitlementsLink baseURL="/permissions" />
    <GroupsLink baseURL="/permissions" />
    <ResourcesLink baseURL="/permissions" />
    <RolesLink baseURL="/permissions" />
    <UsersLink baseURL="/permissions" />
  </>
);
```

The URLs can be accessed through the `url` function that takes a base URL
string that, like the links above, should be set to the location that the `ReBACAdmin`
component is rendered at.

Some URLs are functions that take an object of the params required by the
URL. These params are provided in the function signatures.

```jsx
import { urls } from "@canonical/rebac-admin";

const Links = (): JSX.Element => {
  const adminURLs = urls("/permissions");
  return (
    <>
      <a href={adminURLs.users.add}>Add user</a>
      <a href={adminURLs.users.edit({ id: "abc" })}>Edit user</a>
    </>
  );
};

```

## Limiting access

The admin component should only be displayed to users that have access to manage
permissions. Determining if the user has the correct permissions needs to be
handled in the host app's data layer in the same way that the host would limit
other UI access.

For example, Juju Dashboard can use the existing controller API to check OpenFGA
relations. Using that API the dashboard can check the user's relations and
determine if it should render the `ReBACAdmin` component and associated
navigation.
