import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
  helpText?: string;
  disabled?: boolean;
  placeholder?: string;
}

const ClusteredZfsNameSelector: FC<Props> = ({
  formik,
  helpText,
  disabled = !formik.values.isCreating,
  placeholder,
}) => {
  const { data: clusterMembers = [] } = useClusterMembers();
  const memberNames = clusterMembers.map((member) => member.server_name);

  return (
    <ClusterSpecificInput
      values={formik.values.zfsPoolNamePerClusterMember}
      id="zfsPoolNamePerClusterMember"
      isReadOnly={!formik.values.isCreating}
      onChange={(value) => {
        formik.setFieldValue("zfsPoolNamePerClusterMember", value);
      }}
      canToggleSpecific={formik.values.isCreating}
      memberNames={memberNames}
      disabled={disabled}
      helpText={helpText}
      placeholder={placeholder}
      classname=""
      disabledReason={formik.values.editRestriction}
    />
  );
};

export default ClusteredZfsNameSelector;
