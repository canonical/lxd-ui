import { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { CreateProfileFormValues } from "pages/profiles/CreateProfile";
import { EditProfileFormValues } from "pages/profiles/EditProfile";
import { FormikProps } from "formik/dist/types";

export type SharedFormTypes =
  | CreateInstanceFormValues
  | EditInstanceFormValues
  | CreateProfileFormValues
  | EditProfileFormValues;

export type SharedFormikTypes =
  | FormikProps<CreateInstanceFormValues>
  | FormikProps<EditInstanceFormValues>
  | FormikProps<CreateProfileFormValues>
  | FormikProps<EditProfileFormValues>;
