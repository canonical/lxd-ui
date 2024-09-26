import { LxdIdentity, LxdPermission } from "types/permissions";
import { OptionHTMLAttributes } from "react";
import { LxdImage } from "types/image";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import {
  extractResourceDetailsFromUrl,
  ResourceDetail,
} from "./resourceDetails";
import { LxdMetadata } from "types/config";
import { capitalizeFirstLetter } from "./helpers";
import { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";

type EntitlementOption = OptionHTMLAttributes<HTMLOptionElement> & {
  disabled?: boolean;
  title?: string;
};

export const defaultOption = {
  disabled: true,
  label: "Select an option",
  value: "",
  title: "",
};

export const noneAvailableOption = {
  disabled: true,
  label: "None available",
  value: "",
};

// the resource types comes from the openFGA authorisation model in lxd
// ref: https://discourse.ubuntu.com/t/identity-and-access-management-for-lxd/41516
export const resourceTypeOptions = [
  {
    ...defaultOption,
  },
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

export const getResourceTypeOptions = (metadata?: LxdMetadata | null) => {
  if (!metadata || !metadata.entities) {
    return resourceTypeOptions;
  }

  const options: typeof resourceTypeOptions = [
    {
      ...defaultOption,
    },
  ];

  const resourceTypes = Object.keys(metadata.entities);
  for (const resourceType of resourceTypes) {
    const label = resourceType.split("_");
    label[0] = capitalizeFirstLetter(label[0]);
    options.push({
      value: resourceType,
      label: label.join(" "),
    });
  }

  return options;
};

const sortOptions = (
  a: OptionHTMLAttributes<HTMLOptionElement>,
  b: OptionHTMLAttributes<HTMLOptionElement>,
): number => {
  if (b.label === "Select an option") {
    return 1;
  }

  return (a.label ?? "").localeCompare(b.label as string);
};

export const generateResourceOptions = (
  resourceType: string,
  permissions: LxdPermission[],
  imageNamesLookup: Record<string, string>,
  identityNamesLookup: Record<string, string>,
): OptionHTMLAttributes<HTMLOptionElement>[] => {
  if (!permissions.length || !resourceType) {
    return [];
  }

  const resourceOptions: OptionHTMLAttributes<HTMLOptionElement>[] = [
    defaultOption,
  ];

  const processedResources = new Set<string>();
  for (const permission of permissions) {
    const resource = extractResourceDetailsFromUrl(
      resourceType,
      permission.url,
      imageNamesLookup,
      identityNamesLookup,
    );
    const resourceLabel = getResourceSelectorLabel(resource);

    if (processedResources.has(resourceLabel)) {
      continue;
    }

    processedResources.add(resourceLabel);
    resourceOptions.push({
      value: permission.url,
      label: resourceLabel,
    });
  }

  resourceOptions.sort(sortOptions);

  return resourceOptions;
};

export const getEntitlementDescriptions = (
  metadata: LxdMetadata,
  resourceType: string,
) => {
  const entitlementDescriptions: Record<string, string> = {};
  const entitlements = metadata.entities[resourceType].entitlements;
  for (const entitlement of entitlements) {
    entitlementDescriptions[entitlement.name] = entitlement.description;
  }

  return entitlementDescriptions;
};

export const generateEntitlementOptions = (
  resourceType: string,
  permissions?: LxdPermission[],
  metadata?: LxdMetadata | null,
): EntitlementOption[] => {
  if (!permissions || !resourceType) {
    return [defaultOption];
  }

  // entitlements for all resources related to a particular resource type are the same
  const resource = permissions[0].url;

  // split entitlement options into two based on 'can_' prefix
  const genericEntitlementOptions: EntitlementOption[] = [];
  const granularEntitlementOptions: EntitlementOption[] = [];
  for (const permission of permissions) {
    if (permission.url !== resource) {
      continue;
    }

    const option = {
      value: permission.entitlement,
      label: permission.entitlement,
    };

    if (permission.entitlement.includes("can_")) {
      granularEntitlementOptions.push(option);
      continue;
    }

    genericEntitlementOptions.push(option);
  }

  genericEntitlementOptions.sort(sortOptions);
  granularEntitlementOptions.sort(sortOptions);

  // add disabled option as a delimiter between the two sets of entitlements
  if (
    genericEntitlementOptions.length > 1 &&
    granularEntitlementOptions.length
  ) {
    genericEntitlementOptions.unshift({
      disabled: true,
      label: "Built-in roles",
      value: "",
    });

    granularEntitlementOptions.unshift({
      disabled: true,
      label: "Granular entitlements",
      value: "",
    });
  }

  const allEntitlementOptions = [
    defaultOption,
    ...genericEntitlementOptions,
    ...granularEntitlementOptions,
  ];

  // enrich entitlement options with descriptions if metadata is available
  if (metadata && metadata.entities) {
    const entitlementDescriptions = getEntitlementDescriptions(
      metadata,
      resourceType,
    );

    for (const option of allEntitlementOptions) {
      if (
        option.value &&
        typeof option.value === "string" &&
        entitlementDescriptions[option.value]
      ) {
        option.title = entitlementDescriptions[option.value];
      }
    }
  }

  return [
    defaultOption,
    ...genericEntitlementOptions,
    ...granularEntitlementOptions,
  ];
};

const getResourceSelectorLabel = (resource: ResourceDetail): string => {
  const projectName = resource.project
    ? ` (project: ${resource.project}) `
    : "";
  const targetName = resource.target ? ` (target: ${resource.target}) ` : "";
  const poolName = resource.pool ? ` (pool: ${resource.pool}) ` : "";
  return `${resource.name}${targetName}${poolName}${projectName}`;
};

export const getPermissionId = (permission: LxdPermission): string => {
  return permission.entity_type + permission.url + permission.entitlement;
};

export const getPermissionIds = (permissions: LxdPermission[]): string[] => {
  return permissions.map((permission) => {
    return getPermissionId(permission);
  });
};

export const getResourceLabel = (
  permission: LxdPermission,
  imageNamesLookup?: Record<string, string>,
  identityNamesLookup?: Record<string, string>,
): string => {
  const resource = extractResourceDetailsFromUrl(
    permission.entity_type,
    permission.url,
    imageNamesLookup,
    identityNamesLookup,
  );

  return getResourceSelectorLabel(resource);
};

export const getImageNameLookup = (
  images: LxdImage[],
): Record<string, string> => {
  const nameLookup: Record<string, string> = {};
  for (const image of images) {
    nameLookup[image.fingerprint] =
      `${image.properties?.description} (${image.type})` ?? image.fingerprint;
  }

  return nameLookup;
};

export const getIdentityNameLookup = (
  identities: LxdIdentity[],
): Record<string, string> => {
  const nameLookup: Record<string, string> = {};
  for (const identity of identities) {
    nameLookup[identity.id] = identity.name;
  }

  return nameLookup;
};

const getResourceTypeSortOrder = (): Record<string, number> => {
  const sortOrder: Record<string, number> = {};
  resourceTypeOptions.forEach((option, idx) => {
    sortOrder[option.value] = idx;
  });

  return sortOrder;
};

const resourceTypeSortOrder = getResourceTypeSortOrder();
export const permissionSort = (
  permissionA: FormPermission,
  permissionB: FormPermission,
): number => {
  const resourceTypeComparison =
    resourceTypeSortOrder[permissionA.entity_type] -
    resourceTypeSortOrder[permissionB.entity_type];

  const resourceNameComparison = permissionA.resourceLabel?.localeCompare(
    permissionB.resourceLabel ?? "",
  );

  const entitlementComparison = permissionA.entitlement.localeCompare(
    permissionB.entitlement,
  );

  return (
    resourceTypeComparison || resourceNameComparison || entitlementComparison
  );
};

export const enablePermissionsFeature = (): boolean => {
  const { hasAccessManagement, settings } = useSupportedFeatures();

  const userShowPermissions =
    (settings?.config?.["user.show_permissions"] ?? "false") === "true";

  const hasOIDCSettings =
    !!settings?.config?.["oidc.client.id"] &&
    !!settings?.config?.["oidc.issuer"];

  return hasAccessManagement && (hasOIDCSettings || userShowPermissions);
};
