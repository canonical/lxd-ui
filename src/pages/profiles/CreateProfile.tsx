import React, { FC, useEffect, useState } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Notification,
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
  CLOUD_INIT,
  DISK_DEVICES,
  MAIN_CONFIGURATION,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  NETWORK_DEVICES,
} from "pages/profiles/forms/ProfileFormMenu";
import ProfileDetailsForm, {
  profileDetailPayload,
  ProfileDetailsFormValues,
} from "pages/profiles/forms/ProfileDetailsForm";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useDocs } from "context/useDocs";

export type CreateProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
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
  const [isConfigOpen, setConfigOpen] = useState(false);

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
          toastNotify.success(`Profile ${values.name} created.`);
        })
        .catch((e: Error) => {
          formik.setSubmitting(false);
          notify.failure("Profile creation failed", e);
        })
        .finally(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.profiles],
          });
          void queryClient.invalidateQueries({
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
    const payload = getCreationPayload(formik.values);
    return dumpYaml(payload);
  }

  return (
    <BaseLayout title="Create a profile" contentClassName="create-profile">
      <Form onSubmit={formik.handleSubmit} className="form">
        <ProfileFormMenu
          active={section}
          setActive={updateSection}
          isConfigOpen={Boolean(formik.values.name) && isConfigOpen}
          toggleConfigOpen={toggleMenu}
          hasName={Boolean(formik.values.name)}
          formik={formik}
        />
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
                  This is the YAML representation of the profile.
                  <br />
                  <a
                    href={`${docBaseLink}/profiles`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about profiles
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
