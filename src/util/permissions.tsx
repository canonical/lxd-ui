import { AnyObject, TestFunction } from "yup";
import { AbortControllerState, checkDuplicateName } from "./helpers";
import { LxdGroup, LxdIdentity, LxdPermission } from "types/permissions";
import { OptionHTMLAttributes } from "react";

export const testDuplicatePermissionGroupName = (
  controllerState: AbortControllerState,
  groupType: "lxd-groups" | "idp-groups" = "lxd-groups",
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  const endpoint =
    groupType === "lxd-groups" ? "groups" : "identity-provider-groups";
  return [
    "deduplicate",
    "A permission group with this name already exists",
    (value?: string) => {
      return checkDuplicateName(value, "", controllerState, `auth/${endpoint}`);
    },
  ];
};

export const entityTypeOptions = [
  {
    value: "server",
    label: "Server",
  },
  {
    value: "identity",
    label: "Identity",
  },
  {
    value: "group",
    label: "Group",
  },
  {
    value: "certificate",
    label: "Certificate",
  },
  {
    value: "project",
    label: "Project",
  },
  {
    value: "profile",
    label: "Profile",
  },
  {
    value: "instance",
    label: "Instance",
  },
  {
    value: "image",
    label: "Image",
  },
  {
    value: "image_alias",
    label: "Image alias",
  },
  {
    value: "storage_pool",
    label: "Storage pool",
  },
  {
    value: "storage_volume",
    label: "Storage volume",
  },
  {
    value: "storage_bucket",
    label: "Storage bucket",
  },
  {
    value: "network",
    label: "Network",
  },
  {
    value: "network_acl",
    label: "Network ACL",
  },
  {
    value: "network_zone",
    label: "Network zone",
  },
];

export const generateEntitlementsFromPermissions = (
  entityType: string,
  permissions?: LxdPermission[],
) => {
  if (!permissions) {
    return {
      entitlementEntities: {},
      entitlementOptions: [],
    };
  }

  const entitlementEntities: Record<
    string,
    OptionHTMLAttributes<HTMLOptionElement>[]
  > = {};
  for (const permission of permissions) {
    if (permission.entity_type !== entityType) {
      continue;
    }

    const entitlement = permission.entitlement;
    if (!entitlementEntities[entitlement]) {
      entitlementEntities[entitlement] = [];
    }

    entitlementEntities[entitlement].push({
      value: permission.url,
      label: extractEntityNameFromUrl(entityType, permission.url),
    });
  }

  const entitlementOptions = Object.keys(entitlementEntities).map(
    (entitlement) => ({ value: entitlement, label: entitlement }),
  );
  return { entitlementOptions, entitlementEntities };
};

export const extractEntityNameFromUrl = (entityType: string, url: string) => {
  const urlSegments = url.split("/");
  // TODO: missing certificate, image_alias, storage_bucket, network_acl, network_zone
  switch (entityType) {
    case "server":
      return urlSegments[0];
    case "storage_volume":
      return urlSegments[6].split("?")[0];
    case "identity":
      return urlSegments[5];
    case "group":
      return urlSegments[4];
    case "network":
    case "instance":
    case "image":
    case "profile":
    case "storage_pool":
    case "project":
      return urlSegments[3].split("?")[0];
    default:
      return urlSegments[0];
  }
};

export const getIdentitiesForGroup = (group: LxdGroup) => {
  const oidcIdentities = group.identities?.oidc || [];
  const tlsIdentities = group.identities?.tls || [];
  const allIdentities = oidcIdentities.concat(tlsIdentities);
  const totalIdentities = allIdentities.length;

  return {
    oidcIdentities,
    tlsIdentities,
    allIdentities,
    totalIdentities,
  };
};

export const encodeIdentityNameForUrl = (name: string) => {
  // having "." in the url results in 404 errors when refreshing the page
  return encodeURIComponent(name.replaceAll(".", "#"));
};

export const decodeIdentityNameFromUrl = (name: string) => {
  return decodeURIComponent(name).replaceAll("#", ".");
};

// Given a set of lxd groups and some identities
// Generate a subset of those groups that's allocated to all identities
// Generate a subset of those groups that's allocated to some identities
export const getCurrentGroupAllocationsForIdentities = (
  groups: LxdGroup[],
  identities: LxdIdentity[],
) => {
  const totalIdentitiesCount = identities.length;
  const groupsAllocatedToAllIdentities: string[] = [];
  const groupsAllocatedToSomeIdentities: string[] = [];
  for (const group of groups) {
    let allocatedCount = 0;
    const groupIdentities = new Set(getIdentitiesForGroup(group).allIdentities);
    for (const identity of identities) {
      if (groupIdentities.has(identity.id)) {
        allocatedCount++;
      }
    }
    const groupAllocatedToAll = allocatedCount === totalIdentitiesCount;
    const groupAllocatedToSome = !groupAllocatedToAll && allocatedCount > 0;

    if (groupAllocatedToAll) {
      groupsAllocatedToAllIdentities.push(group.name);
    }

    if (groupAllocatedToSome) {
      groupsAllocatedToSomeIdentities.push(group.name);
    }
  }

  return {
    groupsAllocatedToAllIdentities,
    groupsAllocatedToSomeIdentities,
  };
};

// Given a set of groups that should be allocated to all identities
// Given a set of groups that should be allocated to some identities
// Generate groups to be assigned to each identity
// For groups that should be allocated to only some identities, only allocate to identities that previously had those groups allocated
export const generateGroupAllocationsForIdentities = (args: {
  groupsForAllIdentities: string[];
  groupsForSomeIdentities: string[];
  identities: LxdIdentity[];
}) => {
  const { groupsForAllIdentities, groupsForSomeIdentities, identities } = args;
  const groupsForIdentities: Record<string, string[]> = {};
  for (const identity of identities) {
    const existingIdentityGroups = new Set(identity.groups);
    if (!groupsForIdentities[identity.id]) {
      groupsForIdentities[identity.id] = [];
    }

    groupsForIdentities[identity.id] = [...groupsForAllIdentities];

    for (const group of groupsForSomeIdentities) {
      if (existingIdentityGroups.has(group)) {
        groupsForIdentities[identity.id].push(group);
      }
    }
  }

  return groupsForIdentities;
};
