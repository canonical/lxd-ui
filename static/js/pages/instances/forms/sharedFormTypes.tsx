import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { CreateProfileFormValues } from "pages/profiles/CreateProfileForm";
import { EditProfileFormValues } from "pages/profiles/EditProfileForm";
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
