import React, { FC, useState } from "react";
import {
  CheckboxInput,
  Col,
  Input,
  Row,
  Select,
  Textarea,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";

export interface ProjectDetailsFormValues {
  name: string;
  description?: string;
  restricted: boolean;
  features_images?: boolean;
  features_profiles?: boolean;
  features_networks?: boolean;
  features_networks_zones?: boolean;
  features_storage_buckets?: boolean;
  features_storage_volumes?: boolean;
  readOnly: boolean;
  type: string;
}

export const projectDetailPayload = (values: ProjectDetailsFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

export const projectDetailRestrictionPayload = (
  values: ProjectDetailsFormValues
) => {
  const boolToPayload = (value?: boolean) => {
    if (value === undefined) {
      return undefined;
    }
    return value ? "true" : "false";
  };

  return {
    restricted: boolToPayload(values.restricted),
    "features.images": boolToPayload(values.features_images),
    "features.profiles": boolToPayload(values.features_profiles),
    "features.networks": boolToPayload(values.features_networks),
    "features.networks.zones": boolToPayload(values.features_networks_zones),
    "features.storage.buckets": boolToPayload(values.features_storage_buckets),
    "features.storage.volumes": boolToPayload(values.features_storage_volumes),
  };
};

interface Props {
  formik: FormikProps<ProjectDetailsFormValues>;
}

const ProjectDetailsForm: FC<Props> = ({ formik }) => {
  const figureFeatures = () => {
    if (
      formik.values.features_images ||
      formik.values.features_profiles ||
      formik.values.features_networks ||
      formik.values.features_networks_zones ||
      formik.values.features_storage_buckets ||
      formik.values.features_storage_volumes
    ) {
      return "customized";
    }
    return "default";
  };
  const [features, setFeatures] = useState(figureFeatures());

  return (
    <Row>
      <Col size={8}>
        <Input
          id="name"
          name="name"
          type="text"
          label="Project name"
          placeholder="Enter name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.name}
          error={formik.touched.name ? formik.errors.name : null}
          disabled={formik.values.name === "default" || formik.values.readOnly}
          required
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
          disabled={formik.values.readOnly}
        />
        <Select
          id="features"
          name="features"
          label="Features"
          onChange={(e) => {
            setFeatures(e.target.value);
            if (e.target.value === "default") {
              formik.setFieldValue("features_images", undefined);
              formik.setFieldValue("features_profiles", undefined);
              formik.setFieldValue("features_networks", undefined);
              formik.setFieldValue("features_networks_zones", undefined);
              formik.setFieldValue("features_storage_buckets", undefined);
              formik.setFieldValue("features_storage_volumes", undefined);
            }
          }}
          value={features}
          options={[
            {
              label: "Default LXD",
              value: "default",
            },
            {
              label: "Customized",
              value: "customized",
            },
          ]}
          disabled={formik.values.readOnly}
        />
        {features === "customized" && (
          <>
            Allow the following features:
            <CheckboxInput
              id="features_images"
              name="features_images"
              label="Images"
              onChange={() =>
                formik.setFieldValue(
                  "features_images",
                  !formik.values.features_images
                )
              }
              checked={formik.values.features_images}
              disabled={formik.values.readOnly}
            />
            <CheckboxInput
              id="features_profiles"
              name="features_profiles"
              label="Profiles"
              onChange={() =>
                formik.setFieldValue(
                  "features_profiles",
                  !formik.values.features_profiles
                )
              }
              checked={formik.values.features_profiles}
              disabled={formik.values.readOnly}
            />
            <CheckboxInput
              id="features_networks"
              name="features_networks"
              label="Networks"
              onChange={() =>
                formik.setFieldValue(
                  "features_networks",
                  !formik.values.features_networks
                )
              }
              checked={formik.values.features_networks}
              disabled={formik.values.readOnly}
            />
            <CheckboxInput
              id="features_networks_zones"
              name="features_networks_zones"
              label="Network zones"
              onChange={() =>
                formik.setFieldValue(
                  "features_networks_zones",
                  !formik.values.features_networks_zones
                )
              }
              checked={formik.values.features_networks_zones}
              disabled={formik.values.readOnly}
            />
            <CheckboxInput
              id="features_storage_buckets"
              name="features_storage_buckets"
              label="Storage buckets"
              onChange={() =>
                formik.setFieldValue(
                  "features_storage_buckets",
                  !formik.values.features_storage_buckets
                )
              }
              checked={formik.values.features_storage_buckets}
              disabled={formik.values.readOnly}
            />
            <CheckboxInput
              id="features_storage_volumes"
              name="features_storage_volumes"
              label="Storage volumes"
              onChange={() =>
                formik.setFieldValue(
                  "features_storage_volumes",
                  !formik.values.features_storage_volumes
                )
              }
              checked={formik.values.features_storage_volumes}
              disabled={formik.values.readOnly}
            />
          </>
        )}
        <hr />
        <CheckboxInput
          id="custom_restrictions"
          name="custom_restrictions"
          label="Allow custom restrictions on a project level"
          onChange={() =>
            formik.setFieldValue("restricted", !formik.values.restricted)
          }
          checked={formik.values.restricted}
          disabled={formik.values.readOnly}
        />
      </Col>
    </Row>
  );
};

export default ProjectDetailsForm;
