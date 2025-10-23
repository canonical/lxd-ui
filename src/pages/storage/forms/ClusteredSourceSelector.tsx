import { Label } from "@canonical/react-components";
import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
  helpText?: string;
  canToggleMemberSpecific?: boolean;
  disabledReason?: string;
}

const ClusteredSourceSelector: FC<Props> = ({
  formik,
  helpText,
  canToggleMemberSpecific = true,
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
          formik.setFieldValue("sourcePerClusterMember", value);
        }}
        canToggleSpecific={formik.values.isCreating && canToggleMemberSpecific}
        memberNames={memberNames}
        disabled={!formik.values.isCreating}
        helpText={helpText}
        disabledReason={disabledReason}
      />
    </>
  );
};

export default ClusteredSourceSelector;
