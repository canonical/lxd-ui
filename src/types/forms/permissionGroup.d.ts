import type { LxdPermission } from "types/permissions";
export interface PermissionGroupFormValues {
  name: string;
  description: string;
}

export type GroupSubForm = "identity" | "permission" | null;

export type FormPermission = LxdPermission & {
  id?: string;
  isRemoved?: boolean;
  isAdded?: boolean;
  resourceLabel?: string;
};
