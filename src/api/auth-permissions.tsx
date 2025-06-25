import { handleResponse } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdPermission } from "types/permissions";

export const fetchPermissions = async (
  resourceType: string,
): Promise<LxdPermission[]> => {
  const params = new URLSearchParams();
  params.set("entity-type", resourceType);

  return fetch(`/1.0/auth/permissions?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdPermission[]>) => {
      return (
        // permission data returned from the server is not sorted, this may cause unwanted side effects in UI components
        // see issue in lxd: https://github.com/canonical/lxd/issues/14285
        // TODO: we should remove this sort once the issue is fixed in lxd
        data.metadata.sort((a, b) => {
          if (a.url === b.url) {
            if (a.entitlement === b.entitlement) {
              return a.entity_type.localeCompare(b.entity_type);
            }
            return a.entitlement.localeCompare(b.entitlement);
          }
          return a.url.localeCompare(b.url);
        })
      );
    });
};
