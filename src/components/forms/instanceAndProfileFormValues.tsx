import { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { CreateProfileFormValues } from "pages/profiles/CreateProfile";
import { EditProfileFormValues } from "pages/profiles/EditProfile";
import { FormikProps } from "formik/dist/types";

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
