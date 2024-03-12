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
      .then((data: LxdApiResponse<LxdPermission[]>) => resolve(data.metadata))
      .catch(reject);
  });
};
