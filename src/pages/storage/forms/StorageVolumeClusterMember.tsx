import type { FC } from "react";
import type { FormikProps } from "formik";
import type { LxdClusterMember } from "types/cluster";
import type { StorageVolumeFormValues } from "types/forms/storageVolume";
import { Label, OutputField, Select } from "@canonical/react-components";
import ClusterMemberExplanationTooltip from "pages/cluster/ClusterMemberExplanationTooltip";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  clusterMembers: LxdClusterMember[];
}

const StorageVolumeClusterMember: FC<Props> = ({ formik, clusterMembers }) => {
  if (
    formik.values.clusterMember === undefined ||
    formik.values.clusterMember === "none"
  ) {
    return null;
  }

  if (!formik.values.isCreating) {
    return (
      <>
        <Label forId="clusterMember">
          <ClusterMemberExplanationTooltip>
            Cluster member
          </ClusterMemberExplanationTooltip>
        </Label>
        <OutputField
          id="clusterMember"
          label=""
          value={formik.values.clusterMember}
          help="Use the migrate button in the header to move the storage volume to another cluster member."
        />
      </>
    );
  }

  return (
    <Select
      id="clusterMember"
      label={
        <ClusterMemberExplanationTooltip>
          Cluster member
        </ClusterMemberExplanationTooltip>
      }
      onChange={(e) => {
        formik.setFieldValue("clusterMember", e.target.value);
      }}
      value={formik.values.clusterMember}
      options={clusterMembers.map((member) => {
        return {
          label: member.server_name,
          value: member.server_name,
        };
      })}
      disabled={formik.values.isClusterMemberLocked}
      required
    />
  );
};

export default StorageVolumeClusterMember;
