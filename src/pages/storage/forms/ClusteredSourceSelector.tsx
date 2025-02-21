import { Label } from "@canonical/react-components";
import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import { FormikProps } from "formik";
import { FC } from "react";
import { StoragePoolFormValues } from "./StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
  helpText?: string;
  disabledReason?: string;
}

const ClusteredSourceSelector: FC<Props> = ({
  formik,
  helpText,
  disabledReason,
}) => {
  const { data: clusterMembers = [] } = useClusterMembers();
  const memberNames = clusterMembers.map((member) => member.server_name);

  return (
    <>
      <Label forId="sourcePerClusterMember">Source</Label>
      <ClusterSpecificInput
        values={formik.values.sourcePerClusterMember}
        id="sourcePerClusterMember"
        isReadOnly={false}
        onChange={(value) => {
          void formik.setFieldValue("sourcePerClusterMember", value);
        }}
        canToggleSpecific={formik.values.isCreating}
        memberNames={memberNames}
        disabled={!formik.values.isCreating}
        helpText={helpText}
        disabledReason={disabledReason}
      />
    </>
  );
};

export default ClusteredSourceSelector;
