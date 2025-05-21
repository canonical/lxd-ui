import type { FC } from "react";
import { Col, Input, Label, Row, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getFormProps } from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "components/ConfigurationTable";
import { getConfigurationRow } from "components/ConfigurationRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import { hasMemberLocalVolumes } from "util/hasMemberLocalVolumes";
import type { LxdStoragePool } from "types/storage";
import type { LxdSettings } from "types/server";
import type { LxdClusterMember } from "types/cluster";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  poolError?: string;
  clusterMembers?: LxdClusterMember[];
  pools?: LxdStoragePool[];
  settings?: LxdSettings;
}

const StorageVolumeFormMain: FC<Props> = ({
  formik,
  poolError,
  clusterMembers = [],
  pools = [],
  settings,
}) => {
  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Label
            forId="storage-pool-selector-volume"
            required={formik.values.isCreating}
          >
            Storage pool
          </Label>
          <StoragePoolSelector
            value={formik.values.pool}
            setValue={(pool) => {
              void formik.setFieldValue("pool", pool);
              if (
                hasMemberLocalVolumes(pool, pools, settings) &&
                clusterMembers.length > 0
              ) {
                formik.setFieldValue(
                  "clusterMember",
                  clusterMembers[0].server_name,
                );
              } else {
                formik.setFieldValue("clusterMember", undefined);
              }
            }}
            selectProps={{
              id: "storage-pool-selector-volume",
              disabled: !formik.values.isCreating,
              error: poolError,
              help: formik.values.isCreating
                ? undefined
                : "Use the migrate button in the header to move the volume to a different storage pool.",
            }}
          />
          {formik.values.clusterMember !== undefined && (
            <Select
              id="clusterMember"
              label="Cluster member"
              onChange={(e) => {
                formik.setFieldValue("clusterMember", e.target.value);
              }}
              value={formik.values.clusterMember}
              options={clusterMembers.map((member) => {
                return { label: member.server_name, value: member.server_name };
              })}
              disabled={!formik.values.isCreating}
              required={formik.values.isCreating}
              help={
                formik.values.isCreating
                  ? undefined
                  : "Cluster member is immutable after creation."
              }
            />
          )}
          <Input
            {...getFormProps(formik, "name")}
            type="text"
            label="Name"
            disabled={!formik.values.isCreating}
            required={formik.values.isCreating}
            help={
              formik.values.isCreating
                ? undefined
                : "Click the name in the header to rename the volume."
            }
          />
          <DiskSizeSelector
            label="Size"
            value={formik.values.size}
            help={
              formik.values.volumeType === "custom"
                ? "Size of storage volume. If empty, volume will not have a size limit within its storage pool."
                : "Size is immutable for non-custom volumes."
            }
            setMemoryLimit={(val?: string) => {
              ensureEditMode(formik);
              formik.setFieldValue("size", val);
            }}
            disabled={
              !!formik.values.editRestriction ||
              formik.values.volumeType !== "custom"
            }
          />
          <Select
            {...getFormProps(formik, "content_type")}
            options={[
              {
                label: "filesystem",
                value: "filesystem",
              },
              {
                label: "block",
                value: "block",
              },
            ]}
            label="Content type"
            help={
              formik.values.isCreating
                ? "Type filesystem is ready to mount and write files to. Type block can only be attached to VMs, and is treated like an empty block device."
                : "Content type is immutable after creation."
            }
            onChange={(e) => {
              if (e.target.value === "block") {
                formik.setFieldValue("block_filesystem", undefined);
                formik.setFieldValue("block_mount_options", undefined);
                formik.setFieldValue("block_type", undefined);
                formik.setFieldValue("security_shifted", undefined);
                formik.setFieldValue("security_unmapped", undefined);
              }
              formik.setFieldValue("content_type", e.target.value);
            }}
            disabled={!formik.values.isCreating}
          />
        </Col>
      </Row>
      {formik.values.content_type === "filesystem" && (
        <ConfigurationTable
          rows={[
            getConfigurationRow({
              formik,
              label: "Security shifted",
              name: "security_shifted",
              defaultValue: "",
              disabled: formik.values.security_unmapped === "true",
              disabledReason:
                "This setting can't be changed while security unmapped is set to true",
              children: <Select options={optionTrueFalse} />,
            }),

            getConfigurationRow({
              formik,
              label: "Security unmapped",
              name: "security_unmapped",
              defaultValue: "",
              disabled: formik.values.security_shifted === "true",
              disabledReason:
                "This setting can't be changed while security shifted is set to true",
              children: <Select options={optionTrueFalse} />,
            }),
          ]}
        />
      )}
    </ScrollableForm>
  );
};

export default StorageVolumeFormMain;
