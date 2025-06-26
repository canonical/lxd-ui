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
  return fetch(`/1.0/auth/identities?recursion=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdIdentity[]>) => {
      return data.metadata;
    });
};

export const fetchCurrentIdentity = async (): Promise<LxdIdentity> => {
  return fetch(`/1.0/auth/identities/current?recursion=1`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdIdentity>) => {
      return data.metadata;
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
  return fetch(
    `/1.0/auth/identities/${authMethod}/${id}?recursion=1${entitlements}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdIdentity>) => {
      return data.metadata;
    });
};

export const updateIdentity = async (
  identity: Partial<LxdIdentity>,
): Promise<void> => {
  await fetch(
    `/1.0/auth/identities/${identity.authentication_method}/${identity.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(identity),
    },
  ).then(handleResponse);
};

export const updateIdentities = async (
  identities: Partial<LxdIdentity>[],
): Promise<void> => {
  return Promise.allSettled(
    identities.map(async (identity) => updateIdentity(identity)),
  ).then(handleSettledResult);
};

export const deleteIdentity = async (identity: LxdIdentity): Promise<void> => {
  await fetch(
    `/1.0/auth/identities/${identity.authentication_method}/${identity.id}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const deleteIdentities = async (
  identities: LxdIdentity[],
): Promise<void> => {
  return Promise.allSettled(
    identities.map(async (identity) => deleteIdentity(identity)),
  ).then(handleSettledResult);
};

export const createFineGrainedTlsIdentity = async (
  name: string,
  groups: string[],
): Promise<TlsIdentityTokenDetail> => {
  return fetch(`/1.0/auth/identities/tls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      groups: groups,
      token: true,
    }),
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<TlsIdentityTokenDetail>) => {
      return data.metadata;
    });
};
