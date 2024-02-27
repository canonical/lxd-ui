import { handleResponse, handleSettledResult } from "util/helpers";
import { LxdApiResponse } from "types/apiResponse";
import {
  IdpGroup,
  LxdGroup,
  LxdIdentity,
  LxdPermission,
} from "types/permissions";
import { getIdentitiesForGroup } from "util/permissions";

// auth identities api endpoints
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

export const updateItentityGroups = (
  identity: Partial<LxdIdentity>,
  groups: string[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/auth/identities/${identity.authentication_method}/${identity.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          groups,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateIdentitiesForGroup = (
  identities: LxdIdentity[],
  group: LxdGroup,
): Promise<void> => {
  const { allIdentities: allExistingIdentities } = getIdentitiesForGroup(group);
  return new Promise((resolve, reject) => {
    const existingIdentitiesForGroup = new Set(allExistingIdentities);
    const newIdentitiesForGroup = new Set(
      identities?.map((identity) => identity.id),
    );
    // Determine if any identities were removed
    const identitiesRemoved = allExistingIdentities?.filter(
      (identity) => !newIdentitiesForGroup.has(identity),
    );
    // Determin if any identities were added to the group
    const identitiesAdded = identities.filter(
      (identity) => !existingIdentitiesForGroup.has(identity.id),
    );

    const removeIdentityPromises =
      identitiesRemoved?.map(async (identity) => {
        // Need to fetch identity details to find existing groups
        const existingGroups = (await fetchIdentity(identity, "oidc")).groups;

        return updateItentityGroups(
          { authentication_method: "oidc", id: identity },
          existingGroups?.filter(
            (existingGroup) => existingGroup !== group.name,
          ) || [],
        );
      }) || [];
    const addIdentityPromises = identitiesAdded.map((identity) =>
      updateItentityGroups(identity, [...(identity.groups || []), group.name]),
    );

    void Promise.allSettled([...removeIdentityPromises, ...addIdentityPromises])
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};

// auth groups api endpoints
export const fetchPermissionGroups = (): Promise<LxdGroup[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdGroup[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchPermissionGroup = (name: string): Promise<LxdGroup> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${name}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdGroup>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createPermissionGroup = (
  group: Partial<LxdGroup>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups`, {
      method: "POST",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deletePermissionGroup = (group: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${group}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updatePermissionGroup = (
  group: Partial<LxdGroup>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${group.name}`, {
      method: "PUT",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renamePermissionGroup = (
  oldName: string,
  newName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${oldName}`, {
      method: "POST",
      body: JSON.stringify({
        name: newName,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

// idp groups api endpoints
export const fetchIdpGroups = (): Promise<IdpGroup[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<IdpGroup[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchIdpGroup = (name: string): Promise<IdpGroup> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${name}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<IdpGroup>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createIdpGroup = (group: Partial<IdpGroup>): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups`, {
      method: "POST",
      body: JSON.stringify({ name: group.name }),
    })
      .then(() =>
        fetch(`/1.0/auth/identity-provider-groups/${group.name}`, {
          method: "PUT",
          body: JSON.stringify(group),
        }),
      )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateIdpGroup = (group: Partial<IdpGroup>): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${group.name}`, {
      method: "PUT",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameIdpGroup = (
  oldName: string,
  newName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${oldName}`, {
      method: "POST",
      body: JSON.stringify({
        name: newName,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteIdpGroup = (group: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${group}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

// auth permissions api endpoints
export const fetchPermissions = (args: {
  entityType: string;
  project?: string;
}): Promise<LxdPermission[]> => {
  const { entityType, project } = args;
  let url = `/1.0/auth/permissions?entity-type=${entityType}`;
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
