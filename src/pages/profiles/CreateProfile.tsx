import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Row,
  useListener,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { checkDuplicateName } from "util/helpers";
import { objectToYaml, yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import type { FormDeviceValues } from "util/formDevices";
import { formDeviceToPayload } from "util/formDevices";
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
import { createProfile } from "api/profiles";
import ProfileFormMenu, {
  BOOT,
  CLOUD_INIT,
  DISK_DEVICES,
  GPU_DEVICES,
  MAIN_CONFIGURATION,
  MIGRATION,
  NETWORK_DEVICES,
  OTHER_DEVICES,
  PROXY_DEVICES,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
} from "pages/profiles/forms/ProfileFormMenu";
import type { ProfileDetailsFormValues } from "pages/profiles/forms/ProfileDetailsForm";
import ProfileDetailsForm, {
  profileDetailPayload,
} from "pages/profiles/forms/ProfileDetailsForm";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useDocs } from "context/useDocs";
import type { MigrationFormValues } from "components/forms/MigrationForm";
import MigrationForm, {
  migrationPayload,
} from "components/forms/MigrationForm";
import GPUDevicesForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import ResourceLink from "components/ResourceLink";
import type { BootFormValues } from "components/forms/BootForm";
import BootForm, { bootPayload } from "components/forms/BootForm";
import type { SshKeyFormValues } from "components/forms/SshKeyForm";
import { sshKeyPayload } from "components/forms/SshKeyForm";

export type CreateProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

const CreateProfile: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(MAIN_CONFIGURATION);

  if (!project) {
    return <>Missing project</>;
  }

  const ProfileSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A profile with this name already exists",
        async (value) =>
          checkDuplicateName(value, project, controllerState, "profiles"),
      )
      .required(),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useListener(window, updateFormHeight, "resize", true);

  const formik = useFormik<CreateProfileFormValues>({
    initialValues: {
      name: "",
      devices: [],
      cloud_init_ssh_keys: [],
      readOnly: false,
      entityType: "profile",
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      const profilePayload = values.yaml
        ? yamlToObject(values.yaml)
        : getCreationPayload(values);

      createProfile(JSON.stringify(profilePayload), project)
        .then(() => {
          navigate(`/ui/project/${encodeURIComponent(project)}/profiles`);
          toastNotify.success(
            <>
              Profile{" "}
              <ResourceLink
                type="profile"
                value={values.name}
                to={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(values.name)}`}
              />{" "}
              created.
            </>,
          );
        })
        .catch((e: Error) => {
          formik.setSubmitting(false);
          notify.failure("Profile creation failed", e);
        })
        .finally(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.profiles],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, project],
          });
        });
    },
  });

  const getCreationPayload = (values: CreateProfileFormValues) => {
    return {
      ...profileDetailPayload(values),
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
  };

  const updateSection = (newItem: string) => {
    if (Boolean(formik.values.yaml) && newItem !== YAML_CONFIGURATION) {
      formik.setFieldValue("yaml", undefined);
    }
    setSection(newItem);
  };

  function getYaml() {
    const payload = getCreationPayload(formik.values);
    return objectToYaml(payload);
  }

  return (
    <BaseLayout title="Create a profile" contentClassName="create-profile">
      <Form onSubmit={formik.handleSubmit} className="form">
        {section !== YAML_CONFIGURATION && (
          <ProfileFormMenu
            active={section}
            setActive={updateSection}
            isDisabled={!formik.values.name}
            formik={formik}
          />
        )}
        <Row className="form-contents" key={section}>
          <Col size={12}>
            <NotificationRow />
            {section === MAIN_CONFIGURATION && (
              <ProfileDetailsForm formik={formik} isEdit={false} />
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
                  entity="profile"
                  href={`${docBaseLink}/profiles`}
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
              formik.values.name
                ? undefined
                : "Please enter a profile name before adding custom configuration"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(`/ui/project/${encodeURIComponent(project)}/profiles`)
          }
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            !formik.values.name ||
            hasDiskError(formik) ||
            hasNetworkError(formik)
          }
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateProfile;
