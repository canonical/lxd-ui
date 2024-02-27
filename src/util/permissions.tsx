import { AnyObject, TestFunction } from "yup";
import { AbortControllerState, checkDuplicateName } from "./helpers";
import { LxdGroup, LxdPermission } from "types/permissions";
import { OptionHTMLAttributes } from "react";

export const permissionsTabs: string[] = [
  "Identities",
  "LXD Groups",
  "IDP Groups",
];

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
