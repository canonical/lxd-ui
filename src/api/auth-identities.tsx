import { handleResponse, handleSettledResult } from "util/helpers";
import { LxdApiResponse } from "types/apiResponse";
import { LxdIdentity } from "types/permissions";

export const fetchIdentities = (): Promise<LxdIdentity[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdIdentity[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchIdentity = (
  id: string,
  authMethod: string,
): Promise<LxdIdentity> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities/${authMethod}/${id}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdIdentity>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const updateIdentity = (identity: Partial<LxdIdentity>) => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/auth/identities/${identity.authentication_method}/${identity.id}`,
      {
        method: "PUT",
        body: JSON.stringify(identity),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateIdentities = (
  identities: Partial<LxdIdentity>[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      identities.map((identity) => updateIdentity(identity)),
    )
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteOIDCIdentity = (identity: LxdIdentity) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities/oidc/${identity.id}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteOIDCIdentities = (
  identities: LxdIdentity[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      identities.map((identity) => deleteOIDCIdentity(identity)),
    )
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};
