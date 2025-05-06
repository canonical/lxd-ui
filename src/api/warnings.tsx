import { handleResponse } from "util/helpers";
import type { LxdWarning } from "types/warning";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";

export const warningEntitlements = ["can_delete"];

export const fetchWarnings = async (
  isFineGrained: boolean | null,
): Promise<LxdWarning[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    warningEntitlements,
  );

  return new Promise((resolve, reject) => {
    fetch(`/1.0/warnings?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdWarning[]>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const deleteWarning = async (warning: LxdWarning): Promise<unknown> => {
  return fetch(`/1.0/warnings/${warning.uuid}`, {
    method: "DELETE",
  }).then(handleResponse);
};
