import { Label } from "@canonical/react-components";
import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import { FormikProps } from "formik";
import { FC } from "react";
import { StoragePoolFormValues } from "./StoragePoolForm";
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
    <>
      <Label forId="zfsNamePerClusterMember">Name</Label>
      <ClusterSpecificInput
        values={formik.values.zfsNamePerClusterMember}
        id="zfsNamePerClusterMember"
        isReadOnly={false}
        onChange={(value) => {
          void formik.setFieldValue("zfsNamePerClusterMember", value);
        }}
        canToggleSpecific={formik.values.isCreating}
        toggleReadOnly={() => {}}
        memberNames={memberNames}
        disabled={disabled}
        helpText={helpText}
        placeholder={placeholder}
      />
    </>
  );
};

export default ClusteredZfsNameSelector;
