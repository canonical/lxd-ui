import { IdpGroup, LxdGroup } from "types/permissions";
import { PermissionGroupFormValues } from "pages/permissions/forms/PermissionGroupForm";
import { IdentityProviderGroupFormValues } from "pages/permissions/forms/IdentityProviderGroupForm";

export const getPermissionGroupEditValues = (
  group: LxdGroup,
): PermissionGroupFormValues => {
  return {
    isCreating: false,
    readOnly: true,
    name: group.name,
    description: group.description,
    permissions: (group.permissions || []).map((permission) => ({
      entityType: permission.entity_type,
      entitlement: permission.entitlement,
      url: permission.url,
    })),
  };
};

export const getIdentityProviderGroupEditValues = (
  group: IdpGroup,
): IdentityProviderGroupFormValues => {
  return {
    isCreating: false,
    readOnly: true,
    name: group.name,
    groups: group.groups,
  };
};
