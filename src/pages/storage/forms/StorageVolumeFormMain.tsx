import { FC } from "react";
import { Col, Input, Label, Row, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import {
  getFormProps,
  StorageVolumeFormValues,
} from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "components/ConfigurationTable";
import { getConfigurationRow } from "components/ConfigurationRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import ScrollableForm from "components/ScrollableForm";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  project: string;
}

const StorageVolumeFormMain: FC<Props> = ({ formik, project }) => {
  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          {formik.values.isCreating && (
            <>
              <Label forId="storage-pool-selector" required>
                Storage pool
              </Label>
              <StoragePoolSelector
                project={project}
                value={formik.values.pool}
                setValue={(val) => void formik.setFieldValue("pool", val)}
              />
            </>
          )}
          <Input
            {...getFormProps(formik, "name")}
            type="text"
            label="Name"
            disabled={formik.values.readOnly || !formik.values.isCreating}
            required={formik.values.isCreating}
            help={
              formik.values.isCreating
                ? undefined
                : "Click the name in the header to rename the volume"
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
            setMemoryLimit={(val?: string) =>
              void formik.setFieldValue("size", val)
            }
            disabled={
              formik.values.readOnly || formik.values.volumeType !== "custom"
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
                void formik.setFieldValue("block_filesystem", undefined);
                void formik.setFieldValue("block_mount_options", undefined);
                void formik.setFieldValue("block_type", undefined);
                void formik.setFieldValue("security_shifted", undefined);
                void formik.setFieldValue("security_unmapped", undefined);
              }
              void formik.setFieldValue("content_type", e.target.value);
            }}
            disabled={formik.values.readOnly || !formik.values.isCreating}
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
              help: "Enable id shifting overlay (allows attach to multiple isolated instances)",
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
              help: "Disable id mapping for the volume",
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
