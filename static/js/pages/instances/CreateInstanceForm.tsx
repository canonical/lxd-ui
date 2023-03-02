import React, { FC, ReactNode, useState } from "react";
import {
  Button,
  Col,
  Form,
  Notification,
  Row,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createInstance, startInstance } from "api/instances";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { RemoteImage } from "types/image";
import { isContainerOnlyImage, isVmOnlyImage } from "util/images";
import { checkDuplicateName } from "util/helpers";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Location } from "history";
import InstanceDetailsForm, {
  InstanceDetailsFormValues,
} from "pages/instances/forms/InstanceDetailsForm";
import MenuItem from "pages/instances/forms/FormMenuItem";
import useNotify from "util/useNotify";
import DevicesForm, {
  DevicesFormValues,
} from "pages/instances/forms/DevicesForm";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
} from "pages/instances/forms/SecurityPoliciesForm";
import SnapshotsForm, {
  SnapshotFormValues,
} from "pages/instances/forms/SnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
} from "pages/instances/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
} from "pages/instances/forms/ResourceLimitsForm";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import YamlForm, { YamlFormValues } from "pages/instances/forms/YamlForm";
import { cpuLimitToPayload } from "util/limits";

export type FormValues = InstanceDetailsFormValues &
  DevicesFormValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  CloudInitFormValues &
  YamlFormValues;

interface RetryFormState {
  retryFormValues: FormValues;
}

const INSTANCE_DETAILS = "Instance details";
const DEVICES = "Devices";
const RESOURCE_LIMITS = "Resource limits";
const SECURITY_POLICIES = "Security policies";
const SNAPSHOTS = "Snapshots";
const CLOUD_INIT = "Cloud init";
const YAML_CONFIGURATION = "YAML configuration";

const CreateInstanceForm: FC = () => {
  const location = useLocation() as Location<RetryFormState | null>;
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(INSTANCE_DETAILS);
  const [isConfigOpen, setConfigOpen] = useState(false);

  if (!project) {
    return <>Missing project</>;
  }

  const InstanceSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An instance with this name already exists",
        (value) =>
          checkDuplicateName(value, project, controllerState, "instances")
      )
      .optional(),
    instanceType: Yup.string().required("Instance type is required"),
  });

  function notifyLaunchedAndStarted(instanceLink: ReactNode) {
    notify.success(<>Launched and started instance {instanceLink}.</>);
  }

  function notifyCreatedButStartFailed(instanceLink: ReactNode, e: Error) {
    notify.failure(
      <>The instance {instanceLink} was created, but could not be started.</>,
      e
    );
  }

  function notifyLaunched(instanceLink: ReactNode) {
    notify.success(<>Launched instance {instanceLink}.</>);
  }

  function notifyLaunchFailed(e: Error, formUrl: string, values: FormValues) {
    notify.failure(<>Instance creation failed.</>, e, [
      {
        label: "Check configuration",
        onClick: () =>
          navigate(formUrl, { state: { retryFormValues: values } }),
      },
    ]);
  }

  const submit = (values: FormValues, shouldStart = true) => {
    const formUrl = location.pathname + location.search;
    navigate(
      `/ui/${project}/instances`,
      notify.queue(notify.info("Creating the instance.", "Processing"))
    );

    const instancePayload = values.yaml
      ? yamlToObject(values.yaml)
      : getCreationPayload(values);

    createInstance(JSON.stringify(instancePayload), project)
      .then((operation) => {
        const instanceName = operation.metadata.resources.instances?.[0]
          .split("/")
          .pop();
        if (!instanceName) {
          return;
        }
        const instanceLink = (
          <Link to={`/ui/${project}/instances/${instanceName}`}>
            {instanceName}
          </Link>
        );
        if (shouldStart) {
          startInstance({
            name: instanceName,
            project: project,
          } as LxdInstance)
            .then(() => {
              notifyLaunchedAndStarted(instanceLink);
            })
            .catch((e: Error) => {
              notifyCreatedButStartFailed(instanceLink, e);
            });
        } else {
          notifyLaunched(instanceLink);
        }
      })
      .catch((e: Error) => {
        notifyLaunchFailed(e, formUrl, values);
      })
      .finally(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      });
  };

  const formik = useFormik<FormValues>({
    initialValues: location.state?.retryFormValues ?? {
      name: "",
      image: undefined,
      instanceType: "container",
      profiles: ["default"],
      devices: [{ type: "", name: "" }],
      limits_cpu: DEFAULT_CPU_LIMIT,
      limits_memory: DEFAULT_MEM_LIMIT,
      limits_memory_swap: false,
      protection_delete: false,
      security_privileged: false,
      security_protection_shift: false,
      security_idmap_base: "",
      security_idmap_size: "",
      security_idmap_isolated: false,
      security_devlxd: false,
      security_devlxd_images: false,
      security_secureboot: false,
      snapshots_pattern: "",
      snapshots_schedule_stopped: false,
      snapshots_schedule: "",
      snapshots_expiry: "",
      ["cloud-init_network-config"]: "",
      ["cloud-init_user-data"]: "",
      ["cloud-init_vendor-data"]: "",
      yaml: undefined,
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      if (!values.image) {
        formik.setSubmitting(false);
        notify.failure("", new Error("No image selected"));
        return;
      }
      submit(values);
    },
  });

  const handleSelectImage = (image: RemoteImage, type: string | null) => {
    void formik.setFieldValue("image", image);
    if (type) {
      void formik.setFieldValue("instanceType", type);
    }
    if (isVmOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "virtual-machine");
    }
    if (isContainerOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "container");
    }
    notify.clear();
  };

  const getCreationPayload = (values: FormValues) => {
    return {
      name: values.name,
      description: values.description,
      devices: values.devices
        .filter((item) => item.type !== "")
        .reduce((obj, { name, ...item }) => {
          return {
            ...obj,
            [name]: item,
          };
        }, {}),
      type: values.instanceType,
      profiles: values.profiles,
      ["limits.cpu"]: cpuLimitToPayload(values.limits_cpu),
      ["limits.memory"]: values.limits_memory.value
        ? `${values.limits_memory.value}${values.limits_memory.unit}`
        : undefined,
      ["limits.memory.swap"]: values.limits_memory_swap,
      ["limits.processes"]: values.limits_processes,
      ["protection.delete"]: values.protection_delete,
      ["security.privileged"]: values.security_privileged,
      ["security.protection.shift"]: values.security_protection_shift,
      ["security.idmap.base"]: values.security_idmap_base,
      ["security.idmap.size"]: values.security_idmap_size,
      ["security.idmap.isolated"]: values.security_idmap_isolated,
      ["security.devlxd"]: values.security_devlxd,
      ["security.devlxd.images"]: values.security_devlxd_images,
      ["security.secureboot"]: values.security_secureboot,
      ["snapshots.pattern"]: values.snapshots_pattern,
      ["snapshots.schedule.stopped"]: values.snapshots_schedule_stopped,
      ["snapshots.schedule"]: values.snapshots_schedule,
      ["snapshots.expiry"]: values.snapshots_expiry,
      ["cloud-init.network-config"]: values["cloud-init_network-config"],
      ["cloud-init.user-data"]: values["cloud-init_user-data"],
      ["cloud-init.vendor-data"]: values["cloud-init_vendor-data"],
      source: {
        alias: values.image?.aliases.split(",")[0],
        mode: "pull",
        protocol: "simplestreams",
        server: values.image?.server,
        type: "image",
      },
    };
  };

  const blockMenu = () => {
    if (!formik.values.image) {
      notify.info("Please select an image before adding custom configuration.");
      return true;
    }
    return false;
  };

  const menuItem = {
    active: section,
    setActive: (newItem: string) => {
      if (blockMenu()) {
        return;
      }
      if (section === YAML_CONFIGURATION && newItem !== YAML_CONFIGURATION) {
        void formik.setFieldValue("yaml", undefined);
      }
      setSection(newItem);
    },
  };

  function getYaml() {
    const payload = getCreationPayload(formik.values);
    return dumpYaml(payload);
  }

  const overrideNotification = (
    <Notification severity="caution" title="Before you add configurations">
      The custom configuration overrides any settings specified through
      profiles.
    </Notification>
  );

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h4 className="p-panel__title">Create new instance</h4>
        </div>
        <div className="p-panel__content">
          <Form
            onSubmit={() => submit(formik.values)}
            stacked
            className="instance-form"
          >
            <div className="p-side-navigation--accordion form-navigation">
              <nav aria-label="Instance creation">
                <ul className="p-side-navigation__list">
                  <MenuItem label={INSTANCE_DETAILS} {...menuItem} />
                  <li className="p-side-navigation__item">
                    <button
                      type="button"
                      className="p-side-navigation__accordion-button"
                      aria-expanded={isConfigOpen ? "true" : "false"}
                      onClick={() =>
                        !blockMenu() && setConfigOpen((old) => !old)
                      }
                    >
                      Configuration
                    </button>
                    <ul
                      className="p-side-navigation__list"
                      aria-expanded={isConfigOpen ? "true" : "false"}
                    >
                      <MenuItem label={DEVICES} {...menuItem} />
                      <MenuItem label={RESOURCE_LIMITS} {...menuItem} />
                      <MenuItem label={SECURITY_POLICIES} {...menuItem} />
                      <MenuItem label={SNAPSHOTS} {...menuItem} />
                      <MenuItem label={CLOUD_INIT} {...menuItem} />
                    </ul>
                  </li>
                  <MenuItem label={YAML_CONFIGURATION} {...menuItem} />
                </ul>
              </nav>
            </div>
            <Row className="form-contents">
              <Col size={12}>
                <NotificationRow />
                {section === INSTANCE_DETAILS && (
                  <InstanceDetailsForm
                    formik={formik}
                    project={project}
                    onSelectImage={handleSelectImage}
                  />
                )}

                {section === DEVICES && (
                  <DevicesForm formik={formik} project={project}>
                    {overrideNotification}
                  </DevicesForm>
                )}

                {section === RESOURCE_LIMITS && (
                  <ResourceLimitsForm formik={formik}>
                    {overrideNotification}
                  </ResourceLimitsForm>
                )}

                {section === SECURITY_POLICIES && (
                  <SecurityPoliciesForm formik={formik}>
                    {overrideNotification}
                  </SecurityPoliciesForm>
                )}

                {section === SNAPSHOTS && (
                  <SnapshotsForm formik={formik}>
                    {overrideNotification}
                  </SnapshotsForm>
                )}

                {section === CLOUD_INIT && <CloudInitForm formik={formik} />}

                {section === YAML_CONFIGURATION && (
                  <YamlForm
                    yaml={getYaml()}
                    setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                  >
                    <Notification
                      severity="caution"
                      title="Before you edit the YAML"
                    >
                      Changes will be discarded, when switching back to the
                      guided forms.
                    </Notification>
                  </YamlForm>
                )}
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            <Button
              appearance="base"
              onClick={() => navigate(`/ui/${project}/instances`)}
            >
              Cancel
            </Button>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid || !formik.values.image}
              buttonLabel="Create"
              appearance="default"
              onClick={() => submit(formik.values, false)}
            />
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid || !formik.values.image}
              buttonLabel="Create and start"
              onClick={() => submit(formik.values)}
            />
          </Col>
        </Row>
      </div>
    </main>
  );
};

export default CreateInstanceForm;
