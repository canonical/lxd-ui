import React, { FC, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import DeleteProjectBtn from "pages/projects/actions/DeleteProjectBtn";
import ProjectFormMenu, {
  CLUSTERS,
  DEVICE_USAGE,
  INSTANCES,
  NETWORKS,
  PROJECT_DETAILS,
  RESOURCE_LIMITS,
} from "pages/projects/forms/ProjectFormMenu";
import ProjectDetailsForm, {
  projectDetailPayload,
  projectDetailRestrictionPayload,
} from "pages/projects/forms/ProjectDetailsForm";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import { CreateProjectFormValues } from "pages/projects/CreateProjectForm";
import * as Yup from "yup";
import { LxdProject } from "types/project";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import ResourceLimitsForm, {
  resourceLimitsPayload,
} from "pages/projects/forms/ResourceLimitsForm";
import ClusterRestrictionForm, {
  clusterRestrictionPayload,
} from "pages/projects/forms/ClusterRestrictionForm";
import InstanceRestrictionForm, {
  instanceRestrictionPayload,
} from "pages/projects/forms/InstanceRestrictionForm";
import DeviceUsageRestrictionForm, {
  deviceUsageRestrictionPayload,
} from "pages/projects/forms/DeviceUsageeRestrictionForm";
import NetworkRestrictionForm, {
  networkRestrictionPayload,
} from "pages/projects/forms/NetworkRestrictionForm";
import classnames from "classnames";
import { FormikProps } from "formik/dist/types";

interface Props {
  project: LxdProject;
}

const EditProjectForm: FC<Props> = ({ project }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(PROJECT_DETAILS);
  const [isRestrictionsOpen, setRestrictionsOpen] = useState(false);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const ProjectSchema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const initialValues = {
    name: project.name,
    readOnly: true,
    description: project.description,
    restricted: project.config.restricted === "true",
    features_images: project.config["features.images"] === "true",
    features_profiles: project.config["features.profiles"] === "true",
    features_networks: project.config["features.networks"] === "true",
    features_networks_zones:
      project.config["features.networks.zones"] === "true",
    features_storage_buckets:
      project.config["features.storage.buckets"] === "true",
    features_storage_volumes:
      project.config["features.storage.volumes"] === "true",
    type: "project",

    limits_instances: project.config["limits.instances"]
      ? parseInt(project.config["limits.instances"])
      : undefined,
    limits_containers: project.config["limits.containers"]
      ? parseInt(project.config["limits.containers"])
      : undefined,
    limits_virtual_machines: project.config["limits.virtual-machines"]
      ? parseInt(project.config["limits.virtual-machines"])
      : undefined,
    limits_disk: project.config["limits.disk"],
    limits_networks: project.config["limits.networks"]
      ? parseInt(project.config["limits.networks"])
      : undefined,
    limits_cpu: project.config["limits.cpu"]
      ? parseInt(project.config["limits.cpu"])
      : undefined,
    limits_memory: project.config["limits.memory"]
      ? parseInt(project.config["limits.memory"])
      : undefined,
    limits_processes: project.config["limits.processes"]
      ? parseInt(project.config["limits.processes"])
      : undefined,

    restricted_cluster_groups: project.config["restricted.cluster.groups"],
    restricted_cluster_target: project.config["restricted.cluster.target"],

    restricted_virtual_machines_low_level:
      project.config["restricted.virtual-machines.lowlevel"],
    restricted_containers_low_level:
      project.config["restricted.containers.lowlevel"],
    restricted_containers_nesting:
      project.config["restricted.containers.nesting"],
    restricted_containers_privilege:
      project.config["restricted.containers.privilege"],
    restricted_container_interception:
      project.config["restricted.containers.interception"],
    restrict_snapshots: project.config["restricted.snapshots"],
    restricted_idmap_uid: project.config["restricted.idmap.uid"],
    restricted_idmap_gid: project.config["restricted.idmap.gid"],

    restricted_devices_disk: project.config["restricted.devices.disk"],
    restricted_devices_disk_paths:
      project.config["restricted.devices.disk.paths"],
    restricted_devices_gpu: project.config["restricted.devices.gpu"],
    restricted_devices_infiniband:
      project.config["restricted.devices.infiniband"],
    restricted_devices_nic: project.config["restricted.devices.nic"],
    restricted_devices_pci: project.config["restricted.devices.pci"],
    restricted_devices_unix_block:
      project.config["restricted.devices.unix-block"],
    restricted_devices_unix_char:
      project.config["restricted.devices.unix-char"],
    restricted_devices_unix_hotplug:
      project.config["restricted.devices.unix-hotplug"],
    restricted_devices_usb: project.config["restricted.devices.usb"],

    restricted_network_access: project.config["restricted.networks.access"],
    restricted_network_subnets: project.config["restricted.networks.subnets"],
    restricted_network_uplinks: project.config["restricted.networks.uplinks"],
    restricted_network_zones: project.config["restricted.networks.zones"],
  };

  const formik: FormikProps<CreateProjectFormValues> = useFormik({
    initialValues: initialValues,
    validationSchema: ProjectSchema,
    onSubmit: (values) => {
      const restrictions = values.restricted
        ? {
            ...clusterRestrictionPayload(values),
            ...instanceRestrictionPayload(values),
            ...deviceUsageRestrictionPayload(values),
            ...networkRestrictionPayload(values),
          }
        : {};
      const projectPayload = {
        ...projectDetailPayload(values),
        config: {
          ...projectDetailRestrictionPayload(values),
          ...resourceLimitsPayload(values),
          ...restrictions,
        },
      } as LxdProject;

      projectPayload.etag = project.etag;

      updateProject(projectPayload)
        .then(() => {
          notify.success(`Project updated.`);
          formik.setFieldValue("readOnly", true);
        })
        .catch((e: Error) => {
          notify.failure("", e, undefined, "Project update failed");
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects],
          });
        });
    },
  });

  const updateSection = (newItem: string) => {
    setSection(newItem);
  };

  const toggleMenu = () => {
    setRestrictionsOpen((old) => !old);
  };

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h4 className="p-panel__title">Project configuration</h4>
        </div>
        <div className="p-panel__content edit-project">
          <Form onSubmit={formik.handleSubmit} stacked className="form">
            <ProjectFormMenu
              active={section}
              setActive={updateSection}
              isRestrictionsOpen={
                isRestrictionsOpen && formik.values.restricted
              }
              isRestrictionsDisabled={!formik.values.restricted}
              toggleRestrictionsOpen={toggleMenu}
            />
            <Row className="form-contents" key={section}>
              <Col size={12}>
                <NotificationRow />
                {section === PROJECT_DETAILS && (
                  <ProjectDetailsForm formik={formik} />
                )}
                {section === RESOURCE_LIMITS && (
                  <ResourceLimitsForm formik={formik} />
                )}
                {section === CLUSTERS && (
                  <ClusterRestrictionForm formik={formik} />
                )}
                {section === INSTANCES && (
                  <InstanceRestrictionForm formik={formik} />
                )}
                {section === DEVICE_USAGE && (
                  <DeviceUsageRestrictionForm formik={formik} />
                )}
                {section === NETWORKS && (
                  <NetworkRestrictionForm formik={formik} />
                )}
              </Col>
            </Row>
          </Form>
          <div className="p-bottom-controls">
            <hr />
            <Row>
              <Col
                size={12}
                className={classnames({
                  "u-align--right": !formik.values.readOnly,
                  "u-space-between": formik.values.readOnly,
                })}
              >
                {formik.values.readOnly ? (
                  <>
                    <DeleteProjectBtn project={project} />
                    <Button
                      appearance="positive"
                      onClick={() => formik.setFieldValue("readOnly", false)}
                    >
                      Edit configuration
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => formik.setValues(initialValues)}>
                      Cancel
                    </Button>
                    <SubmitButton
                      isSubmitting={formik.isSubmitting}
                      isDisabled={!formik.isValid || !formik.values.name}
                      buttonLabel="Save changes"
                      onClick={() => void formik.submitForm()}
                    />
                  </>
                )}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditProjectForm;
