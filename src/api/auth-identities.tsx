import { handleResponse, handleSettledResult } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdIdentity, TlsIdentityTokenDetail } from "types/permissions";
import { withEntitlementsQuery } from "util/entitlements/api";

export const identitiesEntitlements = ["can_delete", "can_edit"];

export const fetchIdentities = async (
  isFineGrained: boolean | null,
): Promise<LxdIdentity[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    identitiesEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdIdentity[]>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchCurrentIdentity = async (): Promise<LxdIdentity> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities/current?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdIdentity>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchIdentity = async (
  id: string,
  authMethod: string,
  isFineGrained: boolean | null,
): Promise<LxdIdentity> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    identitiesEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities/${authMethod}/${id}?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdIdentity>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const updateIdentity = async (identity: Partial<LxdIdentity>) => {
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

export const updateIdentities = async (
  identities: Partial<LxdIdentity>[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      identities.map(async (identity) => updateIdentity(identity)),
    )
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteIdentity = async (identity: LxdIdentity) => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/auth/identities/${identity.authentication_method}/${identity.id}`,
      {
        method: "DELETE",
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteIdentities = async (
  identities: LxdIdentity[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      identities.map(async (identity) => deleteIdentity(identity)),
    )
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};

export const createFineGrainedTlsIdentity = async (
  name: string,
  groups: string[],
): Promise<TlsIdentityTokenDetail> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identities/tls`, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        groups: groups,
        token: true,
      }),
    })
      .then(handleResponse)
      .then((data: LxdApiResponse<TlsIdentityTokenDetail>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};
