import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import type { CreateProfileFormValues } from "pages/profiles/CreateProfile";
import type { EditProfileFormValues } from "pages/profiles/EditProfile";
import type { FormikProps } from "formik/dist/types";

export type InstanceAndProfileFormValues =
  | CreateInstanceFormValues
  | EditInstanceFormValues
  | CreateProfileFormValues
  | EditProfileFormValues;

export type InstanceAndProfileFormikProps =
  | FormikProps<CreateInstanceFormValues>
  | FormikProps<EditInstanceFormValues>
  | FormikProps<CreateProfileFormValues>
  | FormikProps<EditProfileFormValues>;
