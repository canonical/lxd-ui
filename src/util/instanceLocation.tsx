import type { FormikProps } from "formik/dist/types";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";

export const getInstanceLocation = (formik: InstanceAndProfileFormikProps) => {
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);

  if (!isClustered) {
    return undefined;
  }

  if (formik.values.entityType !== "instance") {
    return undefined;
  }

  if (formik.values.isCreating) {
    const createFormik = formik as FormikProps<CreateInstanceFormValues>;
    return createFormik.values.target ?? "any";
  }

  const editFormik = formik as FormikProps<EditInstanceFormValues>;
  return editFormik.values.location;
};
