import React, { FC, useState } from "react";
import {
  CheckboxInput,
  Col,
  Icon,
  Input,
  Row,
  Select,
  Textarea,
  Tooltip,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";

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
    [getProjectKey("restricted")]: boolToPayload(values.restricted),
    [getProjectKey("features_images")]: boolToPayload(values.features_images),
    [getProjectKey("features_profiles")]: boolToPayload(
      values.features_profiles
    ),
    [getProjectKey("features_networks")]: boolToPayload(
      values.features_networks
    ),
    [getProjectKey("features_networks_zones")]: boolToPayload(
      values.features_networks_zones
    ),
    [getProjectKey("features_storage_buckets")]: boolToPayload(
      values.features_storage_buckets
    ),
    [getProjectKey("features_storage_volumes")]: boolToPayload(
      values.features_storage_volumes
    ),
  };
};

interface Props {
  formik: FormikProps<ProjectDetailsFormValues>;
  isEdit: boolean;
}

const ProjectDetailsForm: FC<Props> = ({ formik, isEdit }) => {
  const figureFeatures = () => {
    if (
      formik.values.features_images === undefined &&
      formik.values.features_profiles === undefined &&
      formik.values.features_networks === undefined &&
      formik.values.features_networks_zones === undefined &&
      formik.values.features_storage_buckets === undefined &&
      formik.values.features_storage_volumes === undefined
    ) {
      return "default";
    }
    if (
      formik.values.features_images !== true ||
      formik.values.features_profiles !== true ||
      formik.values.features_networks !== false ||
      formik.values.features_networks_zones !== false ||
      formik.values.features_storage_buckets !== true ||
      formik.values.features_storage_volumes !== true
    ) {
      return "customised";
    }
    return "default";
  };
  const [features, setFeatures] = useState(figureFeatures());

  return (
    <div className="details">
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
            disabled={formik.values.name === "default" || isEdit}
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
                formik.setFieldValue("features_images", true);
                formik.setFieldValue("features_profiles", true);
                formik.setFieldValue("features_networks", undefined);
                formik.setFieldValue("features_networks_zones", undefined);
                formik.setFieldValue("features_storage_buckets", true);
                formik.setFieldValue("features_storage_volumes", true);
              } else {
                formik.setFieldValue("features_images", false);
                formik.setFieldValue("features_profiles", false);
                formik.setFieldValue("features_networks", false);
                formik.setFieldValue("features_networks_zones", false);
                formik.setFieldValue("features_storage_buckets", false);
                formik.setFieldValue("features_storage_volumes", false);
              }
            }}
            value={features}
            options={[
              {
                label: "Default LXD",
                value: "default",
              },
              {
                label: "Customised",
                value: "customised",
              },
            ]}
            disabled={formik.values.readOnly}
          />
          {features === "customised" && (
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
                label={
                  <>
                    Profiles
                    <Tooltip
                      className="checkbox-label-tooltip"
                      message={`Allow profiles to enable custom${"\n"}restrictions on a project level`}
                    >
                      <Icon name="information" />
                    </Tooltip>
                  </>
                }
                onChange={() => {
                  const newValue = !formik.values.features_profiles;
                  formik.setFieldValue("features_profiles", newValue);
                  if (!newValue) {
                    formik.setFieldValue("restricted", false);
                  }
                }}
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
            label={
              <>
                Allow custom restrictions on a project level
                <Tooltip
                  className="checkbox-label-tooltip"
                  message={`Custom restrictions are only available${"\n"}to projects with enabled profiles`}
                >
                  <Icon name="information" />
                </Tooltip>
              </>
            }
            onChange={() =>
              formik.setFieldValue("restricted", !formik.values.restricted)
            }
            checked={formik.values.restricted}
            disabled={
              formik.values.readOnly ||
              (formik.values.features_profiles === false &&
                features === "customised")
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailsForm;
