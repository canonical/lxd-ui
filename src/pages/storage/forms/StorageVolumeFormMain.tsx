import React, { FC } from "react";
import {
  CheckboxInput,
  Col,
  Input,
  Row,
  Select,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import {
  getFormProps,
  StorageVolumeFormValues,
} from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "pages/storage/forms/ConfigurationTable";
import { getConfigurationRowStorage } from "pages/storage/forms/ConfigurationRowStorage";

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
          <Input
            {...getFormProps(formik, "size")}
            type="number"
            help="Size of the storage volume"
            label="Size in GiB"
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
            help="Filesystem is ready to use, block can be formatted and used only on VMs"
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
            getConfigurationRowStorage({
              formik: formik,
              label: "Security shifted",
              name: "security_shifted",
              defaultValue: "",
              help: "Enable id shifting overlay (allows attach to multiple isolated instances)",
              children: (
                <CheckboxInput
                  label="Security shifted"
                  checked={formik.values.security_shifted}
                />
              ),
            }),

            getConfigurationRowStorage({
              formik: formik,
              label: "Security unmapped",
              name: "security_unmapped",
              defaultValue: "",
              help: "Disable id mapping for the volume",
              children: (
                <CheckboxInput
                  label="Security unmapped"
                  checked={formik.values.security_unmapped}
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
