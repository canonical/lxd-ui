import { handleResponse } from "util/helpers";
import { LxdApiResponse } from "types/apiResponse";
import { LxdPermission } from "types/permissions";

export const fetchPermissions = (args: {
  resourceType: string;
  project?: string;
}): Promise<LxdPermission[]> => {
  const { resourceType, project } = args;
  let url = `/1.0/auth/permissions?entity-type=${resourceType}`;
  if (project) {
    url += `&project=${project}`;
  }

  return new Promise((resolve, reject) => {
    fetch(url)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdPermission[]>) => {
        return resolve(
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
          }),
        );
      })
      .catch(reject);
  });
};
