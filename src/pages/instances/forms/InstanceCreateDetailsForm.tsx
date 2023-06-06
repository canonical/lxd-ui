import React, { FC } from "react";
import { Col, Input, Row, Select, Textarea } from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import SelectImageBtn from "pages/images/actions/SelectImageBtn";
import { isContainerOnlyImage, isVmOnlyImage } from "util/images";
import { instanceCreationTypes } from "util/instanceOptions";
import { FormikProps } from "formik/dist/types";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import { RemoteImage } from "types/image";
import InstanceLocationSelect from "pages/instances/forms/InstanceLocationSelect";

export interface InstanceDetailsFormValues {
  name?: string;
  description?: string;
  image?: RemoteImage;
  instanceType: string;
  profiles: string[];
  target?: string;
  type: string;
  readOnly: boolean;
}

export const instanceDetailPayload = (values: CreateInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
    source: {
      alias: values.image?.aliases.split(",")[0],
      mode: "pull",
      protocol: "simplestreams",
      server: values.image?.server,
      type: "image",
    },
  };
};

interface Props {
  formik: FormikProps<CreateInstanceFormValues>;
  onSelectImage: (image: RemoteImage, type: string | null) => void;
  project: string;
}

const InstanceCreateDetailsForm: FC<Props> = ({
  formik,
  onSelectImage,
  project,
}) => {
  function figureBaseImageName() {
    const image = formik.values.image;
    return image
      ? `${image.os} ${image.release} ${image.aliases.split(",")[0]}`
      : "";
  }

  return (
    <div className="details">
      <Row>
        <Col size={8}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Instance name"
            placeholder="Enter name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            rows={Math.max(
              1,
              Math.ceil((formik.values.description?.length ?? 0) / 46)
            )}
          />
        </Col>
      </Row>
      <Row>
        <Col size={8}>
          <Input
            id="baseImage"
            name="baseImage"
            label="Base Image"
            type="text"
            value={figureBaseImageName()}
            placeholder="Select base image"
            disabled
            required
          />
        </Col>
        <Col
          size={4}
          className={
            formik.values.image ? "image-change-link" : "image-select-button"
          }
        >
          <SelectImageBtn
            appearance={formik.values.image ? "link" : "positive"}
            caption={formik.values.image ? "Change image" : "Browse images"}
            onSelect={onSelectImage}
          />
        </Col>
      </Row>
      {formik.values.image && (
        <>
          <Row>
            <Col size={8}>
              <Select
                id="instanceType"
                label="Instance type"
                name="instanceType"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                options={instanceCreationTypes}
                value={formik.values.instanceType}
                disabled={
                  isContainerOnlyImage(formik.values.image) ||
                  isVmOnlyImage(formik.values.image)
                }
              />
              <InstanceLocationSelect formik={formik} />
            </Col>
          </Row>
          <ProfileSelect
            project={project}
            selected={formik.values.profiles}
            setSelected={(value) => formik.setFieldValue("profiles", value)}
            isReadOnly={false}
          />
        </>
      )}
    </div>
  );
};

export default InstanceCreateDetailsForm;
