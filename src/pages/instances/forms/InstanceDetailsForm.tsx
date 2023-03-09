import React, { FC } from "react";
import {
  Col,
  Input,
  Label,
  Row,
  Select,
  Textarea,
} from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import SelectImageBtn from "pages/images/actions/SelectImageBtn";
import { isContainerOnlyImage, isVmOnlyImage } from "util/images";
import { instanceCreationTypes } from "util/instanceOptions";
import { FormikProps } from "formik/dist/types";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import { RemoteImage } from "types/image";

export interface InstanceDetailsFormValues {
  name?: string;
  description?: string;
  image?: RemoteImage;
  instanceType: string;
  profiles: string[];
  type: string;
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

const InstanceDetailsForm: FC<Props> = ({ formik, onSelectImage, project }) => {
  return (
    <>
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
      {formik.values.image ? (
        <>
          <Row>
            <Col size={8}>
              <Input
                id="baseImage"
                name="baseImage"
                label="Base Image"
                type="text"
                value={
                  formik.values.image.os +
                  " " +
                  formik.values.image.release +
                  " " +
                  formik.values.image.aliases.split(",")[0]
                }
                disabled
                required
              />
            </Col>
            <Col size={4} className="image-change-link">
              <SelectImageBtn
                appearance="link"
                caption="Change image"
                onSelect={onSelectImage}
              />
            </Col>
          </Row>
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
            </Col>
          </Row>
        </>
      ) : (
        <Row>
          <Col size={8}>
            <Label required>Base Image</Label>
            <br />
            <SelectImageBtn
              appearance="positive"
              caption="Select image"
              onSelect={onSelectImage}
            />
          </Col>
        </Row>
      )}
      {formik.values.image && (
        <ProfileSelect
          project={project}
          selected={formik.values.profiles}
          setSelected={(value) => formik.setFieldValue("profiles", value)}
        />
      )}
    </>
  );
};

export default InstanceDetailsForm;
