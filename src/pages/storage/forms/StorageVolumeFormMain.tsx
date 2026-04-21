import type { FC } from "react";
import {
  Col,
  Input,
  Label,
  Row,
  Select,
  OutputField,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { StorageVolumeFormValues } from "types/forms/storageVolume";
import ConfigurationTable from "components/ConfigurationTable";
import { getConfigurationRow } from "components/ConfigurationRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/editMode";
import { hasMemberLocalVolumes } from "util/hasMemberLocalVolumes";
import type { LxdStoragePool } from "types/storage";
import type { LxdSettings } from "types/server";
import type { LxdClusterMember } from "types/cluster";
import DiskSizeQuotaLimitation from "components/forms/DiskSizeQuotaLimitation";
import StoragePoolSizeAvailable from "components/forms/StoragePoolSizeAvailable";
import { getStorageVolumeFormProps } from "util/storageVolume";
import StorageVolumeClusterMember from "./StorageVolumeClusterMember";

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
  const pool = pools.find((item) => item.name === formik.values.pool);
  const poolDriver = pool?.driver;
  const isCreating = formik.values.isCreating;

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          {isCreating ? (
            <>
              <Label forId="storage-pool-selector-volume" required={isCreating}>
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
                  error: poolError,
                }}
              />
            </>
          ) : (
            <OutputField
              id="storage-pool-selector-volume"
              label="Storage pool"
              value={formik.values.pool}
              help="Use the migrate button in the header to move the volume to a different storage pool."
            />
          )}
          <StorageVolumeClusterMember
            formik={formik}
            clusterMembers={clusterMembers}
          />
          {isCreating ? (
            <Input
              {...getStorageVolumeFormProps(formik, "name")}
              type="text"
              label="Name"
              required
            />
          ) : (
            <OutputField
              id="storage-volume-name"
              label="Name"
              value={formik.values.name}
              help="Click the name in the header to rename the volume."
            />
          )}

          <DiskSizeSelector
            label="Size"
            value={formik.values.size}
            help={
              (
                <>
                  <DiskSizeQuotaLimitation driver={poolDriver} />
                  {formik.values.volumeType === "custom"
                    ? "If empty, volume will not have a size limit within its storage pool."
                    : "Size is immutable for non-custom volumes."}
                  <br />
                  <StoragePoolSizeAvailable
                    pool={pool}
                    clusterMember={formik.values.clusterMember}
                  />
                </>
              ) as unknown as string
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
          {isCreating ? (
            <Select
              {...getStorageVolumeFormProps(formik, "content_type")}
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
              help="Type filesystem is ready to mount and write files to. Type block can only be attached to VMs, and is treated like an empty block device."
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
            />
          ) : (
            <OutputField
              id="storage-volume-content-type"
              label="Content type"
              value={formik.values.content_type}
              help="Content type is immutable after creation."
            />
          )}
        </Col>
      </Row>
      {formik.values.content_type === "filesystem" && (
        <div>
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
        </div>
      )}
    </ScrollableForm>
  );
};

export default StorageVolumeFormMain;
