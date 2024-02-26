import React, { FC, ReactNode, useEffect, useState } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Icon,
  Notification,
  Row,
  useNotify,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createInstance, startInstance } from "api/instances";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { LxdImageType, RemoteImage } from "types/image";
import { isContainerOnlyImage, isVmOnlyImage, LOCAL_ISO } from "util/images";
import { checkDuplicateName } from "util/helpers";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Location } from "history";
import InstanceCreateDetailsForm, {
  instanceDetailPayload,
  InstanceDetailsFormValues,
} from "pages/instances/forms/InstanceCreateDetailsForm";
import {
  formDeviceToPayload,
  FormDeviceValues,
  remoteImageToIsoDevice,
} from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
  securityPoliciesPayload,
} from "components/forms/SecurityPoliciesForm";
import InstanceSnapshotsForm, {
  SnapshotFormValues,
  snapshotsPayload,
} from "components/forms/InstanceSnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
  cloudInitPayload,
} from "components/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
  resourceLimitsPayload,
} from "components/forms/ResourceLimitsForm";
import YamlForm, { YamlFormValues } from "components/forms/YamlForm";
import InstanceFormMenu, {
  CLOUD_INIT,
  DISK_DEVICES,
  MAIN_CONFIGURATION,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  NETWORK_DEVICES,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import { useEventQueue } from "context/eventQueue";
import { getInstanceName } from "util/operations";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import { fetchProfiles } from "api/profiles";
import {
  hasDiskError,
  hasNetworkError,
  hasNoRootDisk,
} from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useDocs } from "context/useDocs";

export type CreateInstanceFormValues = InstanceDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  CloudInitFormValues &
  YamlFormValues;

interface PresetFormState {
  retryFormValues?: CreateInstanceFormValues;
  selectedImage?: RemoteImage;
  cancelLocation?: string;
  retryFormSection?: string;
}

const CreateInstance: FC = () => {
  const docBaseLink = useDocs();
  const eventQueue = useEventQueue();
  const location = useLocation() as Location<PresetFormState | null>;
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(MAIN_CONFIGURATION);
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
          checkDuplicateName(value, project, controllerState, "instances"),
      )
      .matches(/^[A-Za-z0-9-]+$/, {
        message: "Only alphanumeric and hyphen characters are allowed",
      })
      .matches(/^[A-Za-z].*$/, {
        message: "Instance name must start with a letter",
      })
      .optional(),
    instanceType: Yup.string().required("Instance type is required"),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [section]);
  useEventListener("resize", updateFormHeight);

  const clearCache = () => {
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.operations, project],
    });
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.projects, project],
    });
  };

  const notifyCreationStarted = (instanceName: string) => {
    toastNotify.info(<>Creation for instance {instanceName} started.</>);
  };

  const notifyCreatedNowStarting = (instanceLink: ReactNode) => {
    toastNotify.info(<>Created instance {instanceLink}, now starting it.</>);
    clearCache();
  };

  const notifyCreatedAndStarted = (instanceLink: ReactNode) => {
    toastNotify.success(<>Created and started instance {instanceLink}.</>);
    clearCache();
  };

  const notifyCreatedButStartFailed = (instanceLink: ReactNode, e: Error) => {
    toastNotify.failure(
      "The instance was created, but could not be started.",
      e,
      instanceLink,
    );
    clearCache();
  };

  const notifyCreated = (instanceLink: ReactNode, message?: ReactNode) => {
    toastNotify.success(
      <>
        Created instance {instanceLink}.{message}
      </>,
    );
    clearCache();
  };

  const notifyCreationFailed = (
    e: Error,
    formUrl: string,
    values: CreateInstanceFormValues,
    notifierType?: "inline" | "toast",
    retryFormSection?: string,
  ) => {
    const notifier = notifierType === "toast" ? toastNotify : notify;
    notifier.failure("Instance creation failed", e, null, [
      {
        label: "Check configuration",
        onClick: () =>
          navigate(formUrl, {
            state: { retryFormValues: values, retryFormSection },
          }),
      },
    ]);
    clearCache();
  };

  const creationCompletedHandler = (
    instanceName: string,
    shouldStart: boolean,
    isIsoImage: boolean,
  ) => {
    const instanceLink = (
      <Link to={`/ui/project/${project}/instance/${instanceName}`}>
        {instanceName}
      </Link>
    );

    if (shouldStart) {
      notifyCreatedNowStarting(instanceLink);
      void startInstance({
        name: instanceName,
        project: project,
      } as LxdInstance)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => notifyCreatedAndStarted(instanceLink),
            (msg) => notifyCreatedButStartFailed(instanceLink, new Error(msg)),
          );
        })
        .catch((e: Error) => {
          notifyCreatedButStartFailed(instanceLink, e);
        });
    } else {
      const consoleUrl = `/ui/project/${project}/instance/${instanceName}/console`;
      const message = isIsoImage && (
        <>
          <p>Continue the installation process from its console.</p>
          <Button onClick={() => navigate(consoleUrl)} hasIcon>
            <Icon name="canvas" />
            <span>Open console</span>
          </Button>
        </>
      );
      notifyCreated(instanceLink, message);
    }
  };

  const { data: profiles = [] } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  const submit = (values: CreateInstanceFormValues, shouldStart = true) => {
    const instancePayload: Partial<LxdInstance> = values.yaml
      ? yamlToObject(values.yaml)
      : getPayload(values);

    if (hasNoRootDisk(values, profiles)) {
      setConfigOpen(true);
      setSection(DISK_DEVICES);
      return;
    }

    const formUrl = location.pathname + location.search;
    navigate(`/ui/project/${project}/instances`);

    createInstance(JSON.stringify(instancePayload), project, values.target)
      .then((operation) => {
        const instanceName = getInstanceName(operation.metadata);
        if (!instanceName) {
          return;
        }
        notifyCreationStarted(instanceName);
        const isIsoImage = values.image?.server === LOCAL_ISO;
        eventQueue.set(
          operation.metadata.id,
          () => creationCompletedHandler(instanceName, shouldStart, isIsoImage),
          (msg) =>
            notifyCreationFailed(
              new Error(msg),
              formUrl,
              values,
              "toast",
              section,
            ),
        );
      })
      .catch((e: Error) => {
        if (e.message === "Cancelled") {
          return;
        }
        notifyCreationFailed(e, formUrl, values, undefined, section);
      });
  };

  const formik = useFormik<CreateInstanceFormValues>({
    initialValues: location.state?.retryFormValues ?? {
      instanceType: "container",
      profiles: ["default"],
      devices: [],
      readOnly: false,
      entityType: "instance",
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      submit(values);
    },
  });

  const isLocalIsoImage = formik.values.image?.server === LOCAL_ISO;

  const handleSelectImage = (image: RemoteImage, type: LxdImageType | null) => {
    void formik.setFieldValue("image", image);

    const devices = formik.values.devices.filter(
      (item) => item.type !== "iso-volume",
    );
    if (image.server === LOCAL_ISO) {
      const isoDevice = remoteImageToIsoDevice(image);
      devices.push(isoDevice);
    }
    void formik.setFieldValue("devices", devices);

    if (type) {
      void formik.setFieldValue("instanceType", type);
    } else if (isVmOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "virtual-machine");
    } else if (isContainerOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "container");
    }
  };

  useEffect(() => {
    if (location.state?.selectedImage) {
      const type = location.state.selectedImage.volume
        ? "iso-volume"
        : location.state.selectedImage.type ?? null;
      handleSelectImage(location.state.selectedImage, type);
    }
  }, [location.state?.selectedImage]);

  useEffect(() => {
    if (location.state?.retryFormSection) {
      setSection(location.state.retryFormSection);
    }
  }, [location.state?.retryFormSection]);

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
    if (Boolean(formik.values.yaml) && newItem !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }
    setSection(newItem);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  function getYaml() {
    if (
      location.state?.retryFormSection === YAML_CONFIGURATION &&
      formik.values.yaml
    ) {
      return formik.values.yaml;
    }
    const payload = getPayload(formik.values);
    return dumpYaml(payload);
  }

  const diskError = hasDiskError(formik);
  const networkError = hasNetworkError(formik);
  const hasErrors =
    !formik.isValid || !formik.values.image || diskError || networkError;

  return (
    <BaseLayout title="Create an instance" contentClassName="create-instance">
      <Form onSubmit={formik.handleSubmit} className="form">
        <InstanceFormMenu
          active={section}
          formik={formik}
          setActive={updateSection}
          isConfigDisabled={!formik.values.image}
          isConfigOpen={!!formik.values.image && isConfigOpen}
          toggleConfigOpen={toggleMenu}
          hasDiskError={diskError || hasNoRootDisk(formik.values, profiles)}
          hasNetworkError={networkError}
        />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            <NotificationRow />
            {section === MAIN_CONFIGURATION && (
              <InstanceCreateDetailsForm
                formik={formik}
                project={project}
                onSelectImage={handleSelectImage}
              />
            )}

            {section === DISK_DEVICES && (
              <DiskDeviceForm formik={formik} project={project} />
            )}

            {section === NETWORK_DEVICES && (
              <NetworkDevicesForm formik={formik} project={project} />
            )}

            {section === RESOURCE_LIMITS && (
              <ResourceLimitsForm formik={formik} />
            )}

            {section === SECURITY_POLICIES && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {section === SNAPSHOTS && <InstanceSnapshotsForm formik={formik} />}

            {section === CLOUD_INIT && <CloudInitForm formik={formik} />}

            {section === YAML_CONFIGURATION && (
              <YamlForm
                key={`yaml-form-${formik.values.readOnly}`}
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
              >
                <Notification severity="information" title="YAML Configuration">
                  This is the YAML representation of the instance.
                  <br />
                  <a
                    href={`${docBaseLink}/instances`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about instances
                  </a>
                </Notification>
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <FormFooterLayout>
        <Button
          appearance="base"
          onClick={() =>
            navigate(
              location.state?.cancelLocation ??
                `/ui/project/${project}/instances`,
            )
          }
        >
          Cancel
        </Button>
        <ActionButton
          loading={formik.isSubmitting}
          disabled={hasErrors}
          appearance={isLocalIsoImage ? "positive" : "default"}
          onClick={() => submit(formik.values, false)}
        >
          Create
        </ActionButton>
        {!isLocalIsoImage && (
          <ActionButton
            appearance="positive"
            loading={formik.isSubmitting}
            disabled={hasErrors}
            onClick={() => submit(formik.values)}
          >
            Create and start
          </ActionButton>
        )}
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateInstance;
