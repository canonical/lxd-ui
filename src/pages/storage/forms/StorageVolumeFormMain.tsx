import React, { FC } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import {
  getFormProps,
  StorageVolumeFormValues,
} from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "components/ConfigurationTable";
import { getStorageConfigurationRow } from "pages/storage/forms/StorageConfigurationRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { optionTrueFalse } from "util/instanceOptions";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormMain: FC<Props> = ({ formik }) => {
  return (
    <>
      <Row>
        <Col size={8}>
          <Input
            {...getFormProps(formik, "name")}
            type="text"
            label="Name"
            disabled={formik.values.isReadOnly || !formik.values.isCreating}
            required={formik.values.isCreating}
            help={
              formik.values.isCreating
                ? undefined
                : "Click the name in the header to rename the instance"
            }
          />
          <label className="p-form__label" htmlFor="limits_disk">
            Size
          </label>
          <DiskSizeSelector
            value={formik.values.size}
            setMemoryLimit={(val?: string) =>
              void formik.setFieldValue("size", val)
            }
            disabled={formik.values.isReadOnly}
          />
          <p className="p-form-help-text">
            Size of storage volume. If empty, volume will not have a size limit
            within its storage pool.
          </p>
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
            help="Type filesystem is ready to mount and write files to. Type block can only be attached to VMs, and is treated like an empty block device."
            onChange={(e) => {
              if (e.target.value === "block") {
                void formik.setFieldValue("block_filesystem", undefined);
                void formik.setFieldValue("block_mount_options", undefined);
                void formik.setFieldValue("security_shifted", undefined);
                void formik.setFieldValue("security_unmapped", undefined);
              }
              void formik.setFieldValue("content_type", e.target.value);
            }}
            disabled={formik.values.isReadOnly}
          />
        </Col>
      </Row>
      {formik.values.content_type === "filesystem" && (
        <ConfigurationTable
          rows={[
            getStorageConfigurationRow({
              formik: formik,
              label: "Security shifted",
              name: "security_shifted",
              defaultValue: "",
              help: "Enable id shifting overlay (allows attach to multiple isolated instances)",
              disabled: formik.values.security_unmapped === "true",
              disabledReason:
                "This setting can't be changed while security unmapped is set to true",
              children: <Select options={optionTrueFalse} />,
            }),

            getStorageConfigurationRow({
              formik: formik,
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
    </>
  );
};

export default StorageVolumeFormMain;
