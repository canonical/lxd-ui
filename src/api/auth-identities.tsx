import {
  ensureStableSorting,
  handleResponse,
  handleSettledResult,
} from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdIdentity, TlsIdentityTokenDetail } from "types/permissions";
import { addEntitlements } from "util/entitlements/api";
import { type BearerIdentityType } from "util/permissionIdentities";
import { ROOT_PATH } from "util/rootPath";

export const identitiesEntitlements = ["can_delete", "can_edit"];

export const fetchIdentities = async (
  isFineGrained: boolean | null,
): Promise<LxdIdentity[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, identitiesEntitlements);

  return fetch(`${ROOT_PATH}/1.0/auth/identities?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdIdentity[]>) => {
      data.metadata.map(ensureStableSorting);
      return data.metadata;
    });
};

export const fetchCurrentIdentity = async (): Promise<LxdIdentity> => {
  return fetch(`${ROOT_PATH}/1.0/auth/identities/current?recursion=1`)
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
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, identitiesEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/auth/identities/${encodeURIComponent(authMethod)}/${encodeURIComponent(id)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdIdentity>) => {
      return data.metadata;
    });
};

export const updateIdentity = async (identity: LxdIdentity): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/auth/identities/${encodeURIComponent(identity.authentication_method)}/${encodeURIComponent(identity.id)}`,
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
  identities: LxdIdentity[],
): Promise<void> => {
  return Promise.allSettled(
    identities.map(async (identity) => updateIdentity(identity)),
  ).then(handleSettledResult);
};

export const deleteIdentity = async (identity: LxdIdentity): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/auth/identities/${encodeURIComponent(identity.authentication_method)}/${encodeURIComponent(identity.id)}`,
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
  hasToken = true,
): Promise<TlsIdentityTokenDetail> => {
  return fetch(`${ROOT_PATH}/1.0/auth/identities/tls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      groups: groups,
      token: hasToken,
    }),
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<TlsIdentityTokenDetail>) => {
      return data.metadata;
    });
};

const createBearerIdentity = async (
  name: string,
  type: BearerIdentityType,
  groups: string[],
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/auth/identities/bearer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type,
      groups,
    }),
  }).then(handleResponse);
};

const issueBearerToken = async (
  name: string,
  expiry?: string,
): Promise<{
  token: string;
}> => {
  return fetch(
    `${ROOT_PATH}/1.0/auth/identities/bearer/${encodeURIComponent(name)}/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiry }),
    },
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<{ token: string }>) => {
      return data.metadata;
    });
};

export const createAndIssueBearerToken = async (
  name: string,
  type: BearerIdentityType,
  groups: string[],
  expiry?: string,
): Promise<{
  token: string;
}> => {
  await createBearerIdentity(name, type, groups);
  try {
    return await issueBearerToken(name, expiry);
  } catch (e) {
    // Token issuance failed — delete the identity we just created and
    // rethrow the original error so the caller can display it.
    await fetch(
      `${ROOT_PATH}/1.0/auth/identities/bearer/${encodeURIComponent(name)}`,
      { method: "DELETE" },
    ).catch(() => undefined);
    throw e;
  }
};
