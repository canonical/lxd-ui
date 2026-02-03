import type { FC } from "react";
import {
  CheckboxInput,
  Col,
  Icon,
  Input,
  Row,
  Tooltip,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import { isProjectEmpty } from "util/projects";
import type { LxdProject } from "types/project";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { LxdConfigPair } from "types/config";
import { ensureEditMode } from "util/instanceEdit";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import ProfileRichChip from "pages/profiles/ProfileRichChip";
import NetworkSelector from "./NetworkSelector";
import { useNetworks } from "context/useNetworks";
import type { ProjectDetailsFormValues } from "types/forms/project";

export const projectDetailPayload = (
  values: ProjectDetailsFormValues,
): Partial<LxdProject> => {
  return {
    name: values.name,
    description: values.description,
  };
};

export const projectDetailRestrictionPayload = (
  values: ProjectDetailsFormValues,
): LxdConfigPair => {
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
      values.features_profiles,
    ),
    [getProjectKey("features_networks")]: boolToPayload(
      values.features_networks,
    ),
    [getProjectKey("features_networks_zones")]: boolToPayload(
      values.features_networks_zones,
    ),
    [getProjectKey("features_storage_buckets")]: boolToPayload(
      values.features_storage_buckets,
    ),
    [getProjectKey("features_storage_volumes")]: boolToPayload(
      values.features_storage_volumes,
    ),
  };
};

interface Props {
  formik: FormikProps<ProjectDetailsFormValues>;
  project?: LxdProject;
  isEdit: boolean;
}

const ProjectDetailsForm: FC<Props> = ({ formik, project, isEdit }) => {
  const { hasProjectsNetworksZones, hasStorageBuckets } =
    useSupportedFeatures();

  const { data: networks = [] } = useNetworks(project?.name || "default");
  const managedNetworks = networks.filter((network) => network.managed);
  const isDefaultProject = formik.values.name === "default";
  const isNonEmpty = project ? !isProjectEmpty(project) : false;
  const hadFeaturesNetworkZones =
    project?.config["features.networks.zones"] === "true";
  const hasNoProfiles = !formik.values.features_profiles;
  const hasIsolatedNetworks = formik.values.features_networks;

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
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
            help={
              isEdit &&
              formik.values.name !== "default" &&
              "Click the name in the header to rename the project"
            }
            required
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={(e) => {
              ensureEditMode(formik);
              formik.handleChange(e);
            }}
            value={formik.values.description}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
          <StoragePoolSelector
            value={formik.values.default_instance_storage_pool}
            setValue={(value) =>
              void formik.setFieldValue("default_instance_storage_pool", value)
            }
            selectProps={{
              label: "Default instance storage pool",
              disabled: formik.values.features_profiles === false || isEdit,
              help: isEdit ? (
                <>
                  Edit the storage pool in the{" "}
                  <ProfileRichChip
                    profileName="default"
                    projectName={project?.name ?? ""}
                  />{" "}
                  {" profile"}
                </>
              ) : (
                ""
              ),
            }}
          />
          <NetworkSelector
            value={formik.values.default_project_network}
            setValue={(value) =>
              void formik.setFieldValue("default_project_network", value)
            }
            hasNoneOption
            label="Default instance network"
            disabled={hasNoProfiles || hasIsolatedNetworks || isEdit}
            networkList={managedNetworks}
            help={
              isEdit ? (
                <>
                  Configure networks in the{" "}
                  <ProfileRichChip
                    profileName="default"
                    projectName={project?.name ?? ""}
                  />{" "}
                  profile
                </>
              ) : (
                ""
              )
            }
          />
          <div
            title={
              formik.values.editRestriction ??
              (isDefaultProject
                ? "Custom features are immutable on the default project"
                : "")
            }
          >
            Isolate the following features:
            {!isDefaultProject && (
              <>
                {" "}
                <Tooltip message="Unselected features will be shared with the default project">
                  <Icon name="information" />
                </Tooltip>
              </>
            )}
            <CheckboxInput
              id="features_images"
              name="features_images"
              label="Images"
              onChange={() => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "features_images",
                  !formik.values.features_images,
                );
              }}
              checked={formik.values.features_images}
              disabled={
                !!formik.values.editRestriction ||
                isDefaultProject ||
                isNonEmpty
              }
            />
            <CheckboxInput
              id="features_profiles"
              name="features_profiles"
              label="Profiles"
              onChange={() => {
                ensureEditMode(formik);
                const newValue = !formik.values.features_profiles;
                formik.setFieldValue("features_profiles", newValue);
                if (!newValue) {
                  formik.setFieldValue("restricted", false);
                }
              }}
              checked={formik.values.features_profiles}
              disabled={
                !!formik.values.editRestriction ||
                isDefaultProject ||
                isNonEmpty
              }
            />
            <CheckboxInput
              id="features_networks"
              name="features_networks"
              label="Networks"
              onChange={() => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "features_networks",
                  !formik.values.features_networks,
                );
                const featuresNetworks = !formik.values.features_networks;
                formik.setFieldValue("features_networks", featuresNetworks);
                if (featuresNetworks && !isEdit) {
                  formik.setFieldValue("default_project_network", "none");
                }
              }}
              checked={formik.values.features_networks}
              disabled={
                !!formik.values.editRestriction ||
                isDefaultProject ||
                isNonEmpty
              }
            />
            {hasProjectsNetworksZones && (
              <CheckboxInput
                id="features_networks_zones"
                name="features_networks_zones"
                label="Network zones"
                onChange={() => {
                  ensureEditMode(formik);
                  formik.setFieldValue(
                    "features_networks_zones",
                    !formik.values.features_networks_zones,
                  );
                }}
                checked={formik.values.features_networks_zones}
                disabled={
                  !!formik.values.editRestriction ||
                  isDefaultProject ||
                  (isNonEmpty && hadFeaturesNetworkZones)
                }
              />
            )}
            {hasStorageBuckets && (
              <CheckboxInput
                id="features_storage_buckets"
                name="features_storage_buckets"
                label="Storage buckets"
                onChange={() => {
                  ensureEditMode(formik);
                  formik.setFieldValue(
                    "features_storage_buckets",
                    !formik.values.features_storage_buckets,
                  );
                }}
                checked={formik.values.features_storage_buckets}
                disabled={
                  !!formik.values.editRestriction ||
                  isDefaultProject ||
                  isNonEmpty
                }
              />
            )}
            <CheckboxInput
              id="features_storage_volumes"
              name="features_storage_volumes"
              label="Storage volumes"
              onChange={() => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "features_storage_volumes",
                  !formik.values.features_storage_volumes,
                );
              }}
              checked={formik.values.features_storage_volumes}
              disabled={
                !!formik.values.editRestriction ||
                isDefaultProject ||
                isNonEmpty
              }
            />
          </div>

          <hr />
          <div title={formik.values.editRestriction}>
            <CheckboxInput
              id="custom_restrictions"
              name="custom_restrictions"
              label={
                <>
                  Allow custom restrictions on a project level
                  <Tooltip
                    className="checkbox-label-tooltip"
                    message={`Custom restrictions are only available${"\n"}to projects with isolated profiles`}
                  >
                    <Icon name="information" />
                  </Tooltip>
                </>
              }
              onChange={() => {
                ensureEditMode(formik);
                formik.setFieldValue("restricted", !formik.values.restricted);
              }}
              checked={formik.values.restricted}
              disabled={
                !!formik.values.editRestriction ||
                formik.values.features_profiles === false
              }
            />
          </div>
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProjectDetailsForm;
