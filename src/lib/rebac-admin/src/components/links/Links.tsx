import urls from "urls";

import BaseLink from "./BaseLink";
import type { BaseLinkProps } from "./BaseLink/BaseLink";

type LinkProps = Omit<BaseLinkProps, "to">;

export const IndexLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.index}>
    Canonical ReBAC Admin
  </BaseLink>
);

export const AccessGovernanceLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.accessGovernance.index}>
    Access Governance
  </BaseLink>
);

export const AuthenticationLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.authentication.index}>
    Authentication
  </BaseLink>
);

export const EntitlementsLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.entitlements}>
    Entitlements
  </BaseLink>
);

export const GroupsLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.groups.index}>
    Groups
  </BaseLink>
);

export const ResourcesLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.resources.index}>
    Resources
  </BaseLink>
);

export const RolesLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.roles.index}>
    Roles
  </BaseLink>
);

export const UsersLink = (props: LinkProps) => (
  <BaseLink {...props} to={urls.users.index}>
    Users
  </BaseLink>
);
