import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Icon,
  Row,
  useListener,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createInstance, startInstance } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdImageType, RemoteImage } from "types/image";
import { isContainerOnlyImage, isVmOnlyImage, LOCAL_ISO } from "util/images";
import { objectToYaml, yamlToObject } from "util/yaml";
import type { Location } from "react-router-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import type { InstanceDetailsFormValues } from "pages/instances/forms/InstanceCreateDetailsForm";
import InstanceCreateDetailsForm, {
  instanceDetailPayload,
} from "pages/instances/forms/InstanceCreateDetailsForm";
import type { FormDevice, FormDeviceValues } from "util/formDevices";
import { formDeviceToPayload, remoteImageToIsoDevice } from "util/formDevices";
import type { SecurityPoliciesFormValues } from "components/forms/SecurityPoliciesForm";
import SecurityPoliciesForm, {
  securityPoliciesPayload,
} from "components/forms/SecurityPoliciesForm";
import type { SnapshotFormValues } from "components/forms/InstanceSnapshotsForm";
import InstanceSnapshotsForm, {
  snapshotsPayload,
} from "components/forms/InstanceSnapshotsForm";
import type { CloudInitFormValues } from "components/forms/CloudInitForm";
import CloudInitForm, {
  cloudInitPayload,
} from "components/forms/CloudInitForm";
import type { ResourceLimitsFormValues } from "components/forms/ResourceLimitsForm";
import ResourceLimitsForm, {
  resourceLimitsPayload,
} from "components/forms/ResourceLimitsForm";
import type { YamlFormValues } from "components/forms/YamlForm";
import YamlForm from "components/forms/YamlForm";
import InstanceFormMenu, {
  BOOT,
  CLOUD_INIT,
  DISK_DEVICES,
  MAIN_CONFIGURATION,
  MIGRATION,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  NETWORK_DEVICES,
  GPU_DEVICES,
  OTHER_DEVICES,
  PROXY_DEVICES,
} from "pages/instances/forms/InstanceFormMenu";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import { useEventQueue } from "context/eventQueue";
import { getInstanceName } from "util/operations";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import {
  hasDiskError,
  hasNetworkError,
  hasNoRootDisk,
} from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useDocs } from "context/useDocs";
import { instanceNameValidation } from "util/instances";
import type { MigrationFormValues } from "components/forms/MigrationForm";
import MigrationForm, {
  migrationPayload,
} from "components/forms/MigrationForm";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import GPUDevicesForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import ResourceLabel from "components/ResourceLabel";
import InstanceLinkChip from "./InstanceLinkChip";
import type { InstanceIconType } from "components/ResourceIcon";
import type { BootFormValues } from "components/forms/BootForm";
import BootForm, { bootPayload } from "components/forms/BootForm";
import { useProfiles } from "context/useProfiles";
import type { SshKeyFormValues } from "components/forms/SshKeyForm";
import { sshKeyPayload } from "components/forms/SshKeyForm";

export type CreateInstanceFormValues = InstanceDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
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
  const location = useLocation() as Location<PresetFormState>;
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(MAIN_CONFIGURATION);
  const { hasInstanceCreateStart } = useSupportedFeatures();

  if (!project) {
    return <>Missing project</>;
  }

  const InstanceSchema = Yup.object().shape({
    name: instanceNameValidation(project, controllerState).optional(),
    instanceType: Yup.string().required("Instance type is required"),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [section]);
  useListener(window, updateFormHeight, "resize", true);

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.operations, project],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.projects, project],
    });
  };

  const notifyCreationStarted = (
    instanceName: string,
    instanceType: InstanceIconType,
  ) => {
    toastNotify.info(
      <>
        Creation for instance{" "}
        <ResourceLabel bold type={instanceType} value={instanceName} /> started.
      </>,
    );
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
          void navigate(formUrl, {
            state: { retryFormValues: values, retryFormSection },
          }),
      },
    ]);
    clearCache();
  };

  const notifyCreationAndStarting = (
    instanceName: string,
    instanceType: InstanceIconType,
  ) => {
    toastNotify.info(
      <>
        Instance <ResourceLabel bold type={instanceType} value={instanceName} />{" "}
        creation has begun. The instance will automatically start upon
        completion.
      </>,
    );
  };

  const creationCompletedHandler = (
    instanceName: string,
    shouldStart: boolean,
    isIsoImage: boolean,
    instanceType: InstanceIconType,
  ) => {
    const instanceLink = (
      <InstanceLinkChip
        instance={{ name: instanceName, type: instanceType, project }}
      />
    );

    // only send a second request to start the instance if the lxd version does not support the instance_create_start api extension
    if (shouldStart && !hasInstanceCreateStart) {
      notifyCreatedNowStarting(instanceLink);
      startInstance({
        name: instanceName,
        project: project,
      } as LxdInstance)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              notifyCreatedAndStarted(instanceLink);
            },
            (msg) => {
              notifyCreatedButStartFailed(instanceLink, new Error(msg));
            },
          );
        })
        .catch((e: Error) => {
          notifyCreatedButStartFailed(instanceLink, e);
        });

      return;
    }

    const consoleUrl = `/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(instanceName)}/console`;
    const message = isIsoImage && (
      <>
        <p>Continue the installation process from its console.</p>
        <Button onClick={async () => navigate(consoleUrl)} hasIcon>
          <Icon name="canvas" />
          <span>Open console</span>
        </Button>
      </>
    );

    if (shouldStart) {
      notifyCreatedAndStarted(instanceLink);
    } else {
      notifyCreated(instanceLink, message);
    }
  };

  const { data: profiles = [], isLoading: isProfileLoading } =
    useProfiles(project);

  const submit = (values: CreateInstanceFormValues, shouldStart = true) => {
    const instance: Partial<LxdInstance> = values.yaml
      ? yamlToObject(values.yaml)
      : getPayload(values);

    if (hasNoRootDisk(values, profiles)) {
      setSection(DISK_DEVICES);
      return;
    }

    const formUrl = location.pathname + location.search;
    navigate(`/ui/project/${encodeURIComponent(project)}/instances`);

    // NOTE: for lxd version that has the instance_create_start api extension
    // we can create and start the instance in one go by setting the 'start' property to true
    // we still need to keep the old way of create and start instances since users may be using an older version of lxd
    const instancePayload = {
      ...instance,
      start: hasInstanceCreateStart ? shouldStart : undefined,
    };

    createInstance(JSON.stringify(instancePayload), project, values.target)
      .then((operation) => {
        const instanceName = getInstanceName(operation.metadata);
        if (!instanceName) {
          return;
        }

        if (shouldStart && hasInstanceCreateStart) {
          notifyCreationAndStarting(instanceName, values.instanceType);
        } else {
          notifyCreationStarted(instanceName, values.instanceType);
        }

        const isIsoImage = values.image?.server === LOCAL_ISO;
        eventQueue.set(
          operation.metadata.id,
          () => {
            creationCompletedHandler(
              instanceName,
              shouldStart,
              isIsoImage,
              values.instanceType,
            );
          },
          (msg) => {
            notifyCreationFailed(
              new Error(msg),
              formUrl,
              values,
              "toast",
              section,
            );
          },
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
      cloud_init_ssh_keys: [],
      readOnly: false,
      entityType: "instance",
      isCreating: true,
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      submit(values);
    },
  });

  useEffect(() => {
    if (!isProfileLoading) {
      const hasDefaultProfileAccess = profiles.find(
        (profile) => profile.name === "default",
      );

      if (!hasDefaultProfileAccess) {
        formik.setFieldValue("profiles", []);
      }
    }
  }, [isProfileLoading, profiles]);

  const isLocalIsoImage = formik.values.image?.server === LOCAL_ISO;

  const handleSelectImage = (image: RemoteImage, type?: LxdImageType) => {
    formik.setFieldValue("image", image);

    const devices: FormDevice[] = formik.values.devices.filter(
      (item) => item.type !== "iso-volume",
    );
    if (image.server === LOCAL_ISO) {
      const isoDevice = remoteImageToIsoDevice(image);
      devices.push(isoDevice);
    }
    formik.setFieldValue("devices", devices);

    if (type) {
      formik.setFieldValue("instanceType", type);
    } else if (isVmOnlyImage(image)) {
      formik.setFieldValue("instanceType", "virtual-machine");
    } else if (isContainerOnlyImage(image)) {
      formik.setFieldValue("instanceType", "container");
    }

    if (image.volume?.location && image.volume.location !== "none") {
      // custom ISOs can only run locally to the instance
      // preselect the target by the location of its volume
      formik.setFieldValue("target", image.volume?.location);
      formik.setFieldValue("targetSelectedByVolume", true);
    } else {
      formik.setFieldValue("targetSelectedByVolume", undefined);
    }
  };

  useEffect(() => {
    const imageFromLink = location.state?.selectedImage;
    if (imageFromLink) {
      handleSelectImage(imageFromLink, imageFromLink.type);
    }
  }, [location.state?.selectedImage]);

  useEffect(() => {
    if (location.state?.retryFormSection) {
      setSection(location.state.retryFormSection);
    }
  }, [location.state?.retryFormSection]);

  const getPayload = (values: CreateInstanceFormValues) => {
    const result = {
      ...instanceDetailPayload(values),
      devices: formDeviceToPayload(values.devices),
      config: {
        ...resourceLimitsPayload(values),
        ...securityPoliciesPayload(values),
        ...snapshotsPayload(values),
        ...migrationPayload(values),
        ...bootPayload(values),
        ...cloudInitPayload(values),
        ...sshKeyPayload(values),
      },
    };

    if (values.placementGroup) {
      result.config["placement.group"] = values.placementGroup;
    }

    return result;
  };

  const updateSection = (newItem: string) => {
    if (Boolean(formik.values.yaml) && newItem !== YAML_CONFIGURATION) {
      formik.setFieldValue("yaml", undefined);
    }
    setSection(newItem);
  };

  function getYaml() {
    if (
      location.state?.retryFormSection === YAML_CONFIGURATION &&
      formik.values.yaml
    ) {
      return formik.values.yaml;
    }
    const payload = getPayload(formik.values);
    return objectToYaml(payload);
  }

  const diskError = hasDiskError(formik);
  const networkError = hasNetworkError(formik);
  const hasErrors =
    !formik.isValid || !formik.values.image || diskError || networkError;

  return (
    <BaseLayout title="Create an instance" contentClassName="create-instance">
      <Form onSubmit={formik.handleSubmit} className="form">
        {section !== YAML_CONFIGURATION && (
          <InstanceFormMenu
            active={section}
            setActive={updateSection}
            isDisabled={!formik.values.image}
            hasDiskError={diskError || hasNoRootDisk(formik.values, profiles)}
            hasNetworkError={networkError}
          />
        )}
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

            {section === GPU_DEVICES && (
              <GPUDevicesForm formik={formik} project={project} />
            )}

            {section === PROXY_DEVICES && (
              <ProxyDeviceForm formik={formik} project={project} />
            )}

            {section === OTHER_DEVICES && (
              <OtherDeviceForm formik={formik} project={project} />
            )}

            {section === RESOURCE_LIMITS && (
              <ResourceLimitsForm formik={formik} />
            )}

            {section === SECURITY_POLICIES && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {section === SNAPSHOTS && <InstanceSnapshotsForm formik={formik} />}

            {section === MIGRATION && <MigrationForm formik={formik} />}

            {section === BOOT && <BootForm formik={formik} />}

            {section === CLOUD_INIT && <CloudInitForm formik={formik} />}

            {section === YAML_CONFIGURATION && (
              <YamlForm
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
              >
                <YamlNotification
                  entity="instance"
                  href={`${docBaseLink}/instances`}
                />
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <FormFooterLayout>
        <div className="yaml-switch">
          <YamlSwitch
            formik={formik}
            section={section}
            setSection={updateSection}
            disableReason={
              formik.values.image
                ? undefined
                : "Please select an image before adding custom configuration"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(
              location.state?.cancelLocation ??
                `/ui/project/${encodeURIComponent(project)}/instances`,
            )
          }
        >
          Cancel
        </Button>
        <ActionButton
          loading={formik.isSubmitting}
          disabled={hasErrors || formik.isSubmitting}
          appearance={isLocalIsoImage ? "positive" : "default"}
          onClick={() => {
            submit(formik.values, false);
          }}
        >
          Create
        </ActionButton>
        {!isLocalIsoImage && (
          <ActionButton
            appearance="positive"
            loading={formik.isSubmitting}
            disabled={hasErrors || formik.isSubmitting}
            onClick={() => {
              submit(formik.values);
            }}
          >
            Create and start
          </ActionButton>
        )}
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateInstance;
