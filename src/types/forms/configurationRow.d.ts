import type { FormikProps } from "formik";
import type { InstanceAndProfileFormValues } from "types/forms/instanceAndProfile";
import type { StorageVolumeFormValues } from "types/forms/storageVolume";
import type { NetworkFormValues } from "types/forms/network";
import type { ProjectFormValues } from "types/forms/project";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import type { NetworkAclFormValues } from "types/forms/networkAcl";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

export type ConfigurationRowFormikValues =
  | InstanceAndProfileFormValues
  | StorageVolumeFormValues
  | NetworkAclFormValues
  | NetworkFormValues
  | ProjectFormValues
  | StoragePoolFormValues;

export type ConfigurationRowFormikProps =
  | InstanceAndProfileFormikProps
  | FormikProps<NetworkAclFormValues>
  | FormikProps<NetworkFormValues>
  | FormikProps<ProjectFormValues>
  | FormikProps<StorageVolumeFormValues>
  | FormikProps<StoragePoolFormValues>;
