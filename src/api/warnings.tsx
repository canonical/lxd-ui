import { handleResponse } from "util/helpers";
import type { LxdWarning } from "types/warning";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";

export const warningEntitlements = ["can_delete"];

export const fetchWarnings = async (
  isFineGrained: boolean | null,
): Promise<LxdWarning[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    warningEntitlements,
  );

  return fetch(`/1.0/warnings?recursion=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdWarning[]>) => {
      return data.metadata;
    });
};

export const deleteWarning = async (warningId: string): Promise<unknown> => {
  return fetch(`/1.0/warnings/${warningId}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const deleteWarningBulk = async (
  warningIds: string[],
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      warningIds.map(async (warningId) => {
        return deleteWarning(warningId)
          .then(() => {
            pushSuccess(results);
            continueOrFinish(results, warningIds.length, resolve);
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, warningIds.length, resolve);
          });
      }),
    ).catch(reject);
  });
};
