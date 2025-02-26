import { FC, useEffect, useState } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Row,
  useNotify,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { checkDuplicateName } from "util/helpers";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import { formDeviceToPayload, FormDeviceValues } from "util/formDevices";
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
import { createProfile } from "api/profiles";
import ProfileFormMenu, {
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
} from "pages/profiles/forms/ProfileFormMenu";
import ProfileDetailsForm, {
  profileDetailPayload,
  ProfileDetailsFormValues,
} from "pages/profiles/forms/ProfileDetailsForm";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useDocs } from "context/useDocs";
import MigrationForm, {
  MigrationFormValues,
  migrationPayload,
} from "components/forms/MigrationForm";
import GPUDevicesForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import { PROXY_DEVICES } from "pages/instances/forms/InstanceFormMenu";
import ResourceLink from "components/ResourceLink";
import BootForm, {
  BootFormValues,
  bootPayload,
} from "components/forms/BootForm";

export type CreateProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
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
      .test("deduplicate", "A profile with this name already exists", (value) =>
        checkDuplicateName(value, project, controllerState, "profiles"),
      )
      .required(),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const formik = useFormik<CreateProfileFormValues>({
    initialValues: {
      name: "",
      devices: [],
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
          navigate(`/ui/project/${project}/profiles`);
          toastNotify.success(
            <>
              Profile{" "}
              <ResourceLink
                type="profile"
                value={values.name}
                to={`/ui/project/${project}/profile/${values.name}`}
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
    return dumpYaml(payload);
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
          onClick={() => navigate(`/ui/project/${project}/profiles`)}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
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
