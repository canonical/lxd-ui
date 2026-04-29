import type { ConfigurationRowFormikProps } from "types/forms/configurationRow";

export const ensureEditMode = (formik: ConfigurationRowFormikProps) => {
  if (formik.values.readOnly) {
    formik.setFieldValue("readOnly", false);
  }
};
