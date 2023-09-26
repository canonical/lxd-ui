import React, { FC } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import {
  getFormProps,
  StorageVolumeFormValues,
} from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "components/ConfigurationTable";
import { getStorageConfigurationRow } from "pages/storage/forms/StorageConfigurationRow";
import DiskSizeSelector from "pages/projects/forms/DiskSizeSelector";
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
            required
          />
          <label className="p-form__label" htmlFor="limits_disk">
            Size
          </label>
          <DiskSizeSelector
            value={formik.values.size}
            setMemoryLimit={(val?: string) => formik.setFieldValue("size", val)}
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
                formik.setFieldValue("block_filesystem", undefined);
                formik.setFieldValue("block_mount_options", undefined);
                formik.setFieldValue("security_shifted", undefined);
                formik.setFieldValue("security_unmapped", undefined);
              }
              formik.setFieldValue("content_type", e.target.value);
            }}
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
              children: (
                <Select
                  options={optionTrueFalse}
                  help={
                    formik.values.security_unmapped === "true" ? (
                      <>
                        This setting can{"'"}t be changed while security
                        unmapped is set to{" "}
                        <span className="mono-font">true</span>
                      </>
                    ) : null
                  }
                />
              ),
            }),

            getStorageConfigurationRow({
              formik: formik,
              label: "Security unmapped",
              name: "security_unmapped",
              defaultValue: "",
              help: "Disable id mapping for the volume",
              disabled: formik.values.security_shifted === "true",
              children: (
                <Select
                  options={optionTrueFalse}
                  help={
                    formik.values.security_shifted === "true" ? (
                      <>
                        This setting can{"'"}t be changed while security shifted
                        is set to <span className="mono-font">true</span>
                      </>
                    ) : null
                  }
                />
              ),
            }),
          ]}
        />
      )}
    </>
  );
};

export default StorageVolumeFormMain;
