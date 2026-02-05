import type {
  CreateInstanceFormValues,
  CreateProfileFormValues,
  EditInstanceFormValues,
  EditProfileFormValues,
} from "types/forms/instanceAndProfile";
import type { FormikProps } from "formik/dist/types";

export type InstanceAndProfileFormikProps =
  | FormikProps<CreateInstanceFormValues>
  | FormikProps<EditInstanceFormValues>
  | FormikProps<CreateProfileFormValues>
  | FormikProps<EditProfileFormValues>;
