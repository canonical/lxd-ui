import React, { FC, ReactNode, useEffect, useState } from "react";
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
  instanceDetailPayload,
  InstanceDetailsFormValues,
} from "pages/instances/forms/InstanceDetailsForm";
import { useNotify } from "context/notify";
import { formDeviceToPayload, FormDeviceValues } from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
  securityPoliciesPayload,
} from "pages/instances/forms/SecurityPoliciesForm";
import SnapshotsForm, {
  SnapshotFormValues,
  snapshotsPayload,
} from "pages/instances/forms/SnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
  cloudInitPayload,
} from "pages/instances/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
  resourceLimitsPayload,
} from "pages/instances/forms/ResourceLimitsForm";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import YamlForm, { YamlFormValues } from "pages/instances/forms/YamlForm";
import InstanceFormMenu, {
  CLOUD_INIT,
  STORAGE,
  INSTANCE_DETAILS,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  NETWORKS,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import StorageForm from "pages/instances/forms/StorageForm";
import NetworkForm from "pages/instances/forms/NetworkForm";

export type CreateInstanceFormValues = InstanceDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  CloudInitFormValues &
  YamlFormValues;

interface RetryFormState {
  retryFormValues: CreateInstanceFormValues;
}

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

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

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

  function notifyLaunchFailed(
    e: Error,
    formUrl: string,
    values: CreateInstanceFormValues
  ) {
    notify.failure(<>Instance creation failed.</>, e, [
      {
        label: "Check configuration",
        onClick: () =>
          navigate(formUrl, { state: { retryFormValues: values } }),
      },
    ]);
  }

  const submit = (values: CreateInstanceFormValues, shouldStart = true) => {
    const formUrl = location.pathname + location.search;
    navigate(
      `/ui/${project}/instances`,
      notify.queue(notify.info("Creating the instance.", "Processing"))
    );

    const instancePayload = values.yaml
      ? yamlToObject(values.yaml)
      : getPayload(values);

    createInstance(JSON.stringify(instancePayload), project)
      .then((operation) => {
        const instanceName = operation.metadata.resources.instances?.[0]
          .split("/")
          .pop();
        if (!instanceName) {
          return;
        }
        const instanceLink = (
          <Link to={`/ui/${project}/instances/detail/${instanceName}`}>
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

  const formik = useFormik<CreateInstanceFormValues>({
    initialValues: location.state?.retryFormValues ?? {
      instanceType: "container",
      profiles: ["default"],
      devices: [{ type: "nic", name: "" }],
      limits_cpu: DEFAULT_CPU_LIMIT,
      limits_memory: DEFAULT_MEM_LIMIT,
      type: "instance",
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

  const getPayload = (values: CreateInstanceFormValues) => {
    return {
      ...instanceDetailPayload(values),
      devices: formDeviceToPayload(values.devices),
      config: {
        ...resourceLimitsPayload(values),
        ...securityPoliciesPayload(values),
        ...snapshotsPayload(values),
        ...cloudInitPayload(values),
      },
    };
  };

  const updateSection = (newItem: string) => {
    if (section === YAML_CONFIGURATION && newItem !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }
    setSection(newItem);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  function getYaml() {
    const payload = getPayload(formik.values);
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
          <h1 className="p-panel__title">Create new instance</h1>
        </div>
        <div className="p-panel__content create-instance">
          <Form onSubmit={() => submit(formik.values)} stacked className="form">
            <InstanceFormMenu
              active={section}
              setActive={updateSection}
              isConfigDisabled={!formik.values.image}
              isConfigOpen={isConfigOpen}
              toggleConfigOpen={toggleMenu}
            />
            <Row className="form-contents" key={section}>
              <Col size={12}>
                <NotificationRow />
                {section === INSTANCE_DETAILS && (
                  <InstanceDetailsForm
                    formik={formik}
                    project={project}
                    onSelectImage={handleSelectImage}
                  />
                )}

                {section === STORAGE && (
                  <StorageForm formik={formik} project={project}>
                    {overrideNotification}
                  </StorageForm>
                )}

                {section === NETWORKS && (
                  <NetworkForm formik={formik} project={project}>
                    {overrideNotification}
                  </NetworkForm>
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
        </div>
      </div>
    </main>
  );
};

export default CreateInstanceForm;
