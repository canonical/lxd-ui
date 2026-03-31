import type { FC } from "react";
import { Input, OutputField } from "@canonical/react-components";
import type { FormikProps } from "formik";
import {
  getSourceHelpForDriver,
  isClusterWideSourceDriver,
} from "util/storageOptions";
import ClusteredSourceSelector from "./ClusteredSourceSelector";
import { isClusteredServer } from "util/settings";
import type { LxdSettings } from "types/server";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { getFormProps } from "util/storagePoolForm";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
  settings?: LxdSettings;
  hasSource: boolean;
}
const StoragePoolSource: FC<Props> = ({ formik, settings, hasSource }) => {
  if (!hasSource) {
    return null;
  }
  const isCreating = formik.values.isCreating;
  const isClusterWideSource = isClusterWideSourceDriver(formik.values.driver);

  if (isClusteredServer(settings)) {
    return (
      <ClusteredSourceSelector
        formik={formik}
        helpText={
          isCreating
            ? getSourceHelpForDriver(formik.values.driver)
            : "Source can't be changed"
        }
        disabledReason={formik.values.editRestriction}
        canToggleMemberSpecific={!isClusterWideSource}
      />
    );
  }
  if (isCreating) {
    return (
      <Input
        {...getFormProps(formik, "source")}
        type="text"
        disabled={!!formik.values.editRestriction}
        help={getSourceHelpForDriver(formik.values.driver)}
        label="Source"
        title={formik.values.editRestriction}
      />
    );
  }

  return (
    <OutputField
      id="source"
      label="Source"
      value={formik.values.source}
      help="Source cannot be changed."
    />
  );
};

export default StoragePoolSource;
