import { setupWorker } from "msw";

import { getAuthenticationMSW } from "api/authentication/authentication.msw";
import { getAuthenticationIdMSW } from "api/authentication-id/authentication-id.msw";
import { getEntitlementsMSW } from "api/entitlements/entitlements.msw";
import { getGroupsMSW } from "api/groups/groups.msw";
import { getGroupsIdMSW } from "api/groups-id/groups-id.msw";
import { getResourcesMSW } from "api/resources/resources.msw";
import { getRolesMSW } from "api/roles/roles.msw";
import { getRolesIdMSW } from "api/roles-id/roles-id.msw";
import { getUsersMSW } from "api/users/users.msw";
import { getUsersIdMSW } from "api/users-id/users-id.msw";

export const mockApiWorker = setupWorker(
  ...getAuthenticationMSW(),
  ...getAuthenticationIdMSW(),
  ...getEntitlementsMSW(),
  ...getGroupsMSW(),
  ...getGroupsIdMSW(),
  ...getResourcesMSW(),
  ...getRolesMSW(),
  ...getRolesIdMSW(),
  ...getUsersMSW(),
  ...getUsersIdMSW(),
);
