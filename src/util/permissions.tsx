import type { LxdIdentity, LxdPermission } from "types/permissions";
import type { LxdImage } from "types/image";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { ResourceDetail } from "./resourceDetails";
import { extractResourceDetailsFromUrl } from "./resourceDetails";
import type { LxdMetadata } from "types/config";
import { capitalizeFirstLetter } from "./helpers";
import type { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";
import ResourceOptionLabel from "pages/permissions/panels/ResourceOptionLabel";
import EntitlementOptionLabel from "pages/permissions/panels/EntitlementOptionLabel";
import type { CustomSelectOption } from "@canonical/react-components";
import { getOptionText } from "@canonical/react-components/dist/components/CustomSelect/CustomSelectDropdown";

export const noneAvailableOption = {
  disabled: true,
  label: "None available",
  value: "",
};

// the resource types comes from the openFGA authorisation model in lxd
// ref: https://discourse.ubuntu.com/t/identity-and-access-management-for-lxd/41516
export const resourceTypeOptions = [
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

export const sortOptions = (
  a: CustomSelectOption,
  b: CustomSelectOption,
): number => {
  // sort options alphabetically
  const textA = getOptionText(a) || a.value;
  const textB = getOptionText(b) || b.value;
  return textA.localeCompare(textB);
};

export const getResourceTypeOptions = (
  metadata?: LxdMetadata | null,
): CustomSelectOption[] => {
  if (!metadata || !metadata.entities) {
    return resourceTypeOptions.sort(sortOptions);
  }

  const options: CustomSelectOption[] = [];

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

export const generateResourceOptions = (
  resourceType: string,
  permissions: LxdPermission[],
  imageLookup: Record<string, LxdImage>,
  identityNamesLookup: Record<string, string>,
): CustomSelectOption[] => {
  if (!permissions.length || !resourceType) {
    return [];
  }

  const resourceOptions: CustomSelectOption[] = [];

  const processedResources = new Set<string>();
  for (const permission of permissions) {
    const resource = extractResourceDetailsFromUrl(
      resourceType,
      permission.url,
      imageLookup,
      identityNamesLookup,
    );
    const name = getResourceName(resource);

    if (processedResources.has(name)) {
      continue;
    }

    processedResources.add(name);
    resourceOptions.push({
      value: permission.url,
      label: <ResourceOptionLabel resource={resource} />,
      text: name,
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
): CustomSelectOption[] => {
  if (!permissions || !resourceType) {
    return [];
  }

  // entitlements for all resources related to a particular resource type are the same
  const resource = permissions[0].url;

  // split entitlement options into two based on 'can_' prefix
  const genericEntitlementOptions: CustomSelectOption[] = [];
  const granularEntitlementOptions: CustomSelectOption[] = [];
  for (const permission of permissions) {
    if (permission.url !== resource) {
      continue;
    }

    const option = {
      value: permission.entitlement,
      label: permission.entitlement,
    };

    if (permission.entitlement.includes("can_")) {
      granularEntitlementOptions.push({
        ...option,
      });
      continue;
    }

    genericEntitlementOptions.push({
      ...option,
    });
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
      value: "group",
    });

    granularEntitlementOptions.unshift({
      disabled: true,
      label: "Granular entitlements",
      value: "group",
    });
  }

  const allEntitlementOptions = [
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
        option.text = option.value;
        option.label = (
          <EntitlementOptionLabel
            entitlement={option.value}
            description={entitlementDescriptions[option.value]}
          />
        );
      }

      if (option.value === "group") {
        option.label = (
          <div className="header u-no-padding">
            <span className="u-no-margin">
              <h5 className="u-no-margin u-no-padding">{option.label}</h5>
            </span>
          </div>
        );
      }
    }
  }

  return [...genericEntitlementOptions, ...granularEntitlementOptions];
};

const getResourceName = (resource: ResourceDetail): string => {
  const projectName = resource.project
    ? ` (project: ${resource.project}) `
    : "";
  const targetName = resource.target ? ` (target: ${resource.target}) ` : "";
  const poolName = resource.pool ? ` (pool: ${resource.pool}) ` : "";
  const aliases = resource.aliases
    ? ` (aliases: ${resource.aliases.join(", ")}) `
    : "";
  const fingerprint = resource.fingerprint
    ? ` (fingerprint: ${resource.fingerprint}) `
    : "";
  return `${resource.name}${targetName}${poolName}${projectName}${aliases}${fingerprint}`;
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
  imageLookup?: Record<string, LxdImage>,
  identityNamesLookup?: Record<string, string>,
): string => {
  const resource = extractResourceDetailsFromUrl(
    permission.entity_type,
    permission.url,
    imageLookup,
    identityNamesLookup,
  );

  return getResourceName(resource);
};

export const getImageLookup = (
  images: LxdImage[],
): Record<string, LxdImage> => {
  const nameLookup: Record<string, LxdImage> = {};
  for (const image of images) {
    nameLookup[image.fingerprint] = {
      ...image,
      name: `${image.properties?.description || image.fingerprint} (${image.type})`,
    };
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

// each resource type has specific columns to display, which should uniquely identify the resource
export const getResourceOptionColumns = (type: string) => {
  const resourceOptionColumns: Record<string, (keyof ResourceDetail)[]> = {
    image: ["description", "aliases", "fingerprint", "imageType", "project"],
    image_alias: ["name", "project"],
    instance: ["name", "project"],
    network: ["name", "project"],
    network_acl: ["name", "project"],
    network_zone: ["name", "project"],
    profile: ["name", "project"],
    storage_bucket: ["name", "project"],
    storage_volume: ["name", "pool", "project"],
    default: ["name"],
  };

  return resourceOptionColumns[type] ?? resourceOptionColumns.default;
};
