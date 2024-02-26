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
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormDeviceValues, formDeviceToPayload } from "util/formDevices";
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
import { updateProfile } from "api/profiles";
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
import { LxdProfile } from "types/profile";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import ProfileDetailsForm, {
  profileDetailPayload,
  ProfileDetailsFormValues,
} from "pages/profiles/forms/ProfileDetailsForm";
import { getUnhandledKeyValues } from "util/formFields";
import { getProfileConfigKeys } from "util/instanceConfigFields";
import { getProfileEditValues } from "util/instanceEdit";
import { slugify } from "util/slugify";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useDocs } from "context/useDocs";

export type EditProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  CloudInitFormValues &
  YamlFormValues;

interface Props {
  profile: LxdProfile;
  featuresProfiles: boolean;
}

const EditProfile: FC<Props> = ({ profile, featuresProfiles }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { project, section } = useParams<{
    project: string;
    section?: string;
  }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isConfigOpen, setConfigOpen] = useState(true);

  if (!project) {
    return <>Missing project</>;
  }

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const ProfileSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });

  const formik = useFormik<EditProfileFormValues>({
    initialValues: getProfileEditValues(profile),
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      const profilePayload = (
        values.yaml ? yamlToObject(values.yaml) : getPayload(values)
      ) as LxdProfile;

      // ensure the etag is set (it is missing on the yaml)
      profilePayload.etag = profile.etag;

      updateProfile(profilePayload, project)
        .then(() => {
          toastNotify.success(`Profile ${profile.name} updated.`);
          void formik.setValues(getProfileEditValues(profilePayload));
        })
        .catch((e: Error) => {
          notify.failure("Profile update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.profiles],
          });
        });
    },
  });

  const getPayload = (values: EditProfileFormValues) => {
    const handledConfigKeys = getProfileConfigKeys();
    const handledKeys = new Set(["name", "description", "devices", "config"]);

    return {
      ...profileDetailPayload(values),
      devices: formDeviceToPayload(values.devices),
      config: {
        ...resourceLimitsPayload(values),
        ...securityPoliciesPayload(values),
        ...snapshotsPayload(values),
        ...cloudInitPayload(values),
        ...getUnhandledKeyValues(profile.config, handledConfigKeys),
      },
      ...getUnhandledKeyValues(profile, handledKeys),
    };
  };

  const updateSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project}/profile/${profile.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  const getYaml = () => {
    const exclude = new Set(["used_by", "etag"]);
    const profile = getPayload(formik.values);
    const bareProfile = Object.fromEntries(
      Object.entries(profile).filter((e) => !exclude.has(e[0])),
    );
    return dumpYaml(bareProfile);
  };

  const readOnly = formik.values.readOnly;

  return (
    <div className="edit-profile">
      {!featuresProfiles && (
        <Notification severity="caution" title="Inherited profile">
          Modifications are only available in the{" "}
          <Link
            to={`/ui/project/default/profile/${profile.name}/configuration`}
          >
            default project
          </Link>
          .
        </Notification>
      )}
      <Form onSubmit={formik.handleSubmit} className="form">
        <ProfileFormMenu
          active={section ?? slugify(MAIN_CONFIGURATION)}
          setActive={updateSection}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
          hasName={true}
          formik={formik}
        />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {(section === slugify(MAIN_CONFIGURATION) || !section) && (
              <ProfileDetailsForm formik={formik} isEdit={true} />
            )}

            {section === slugify(DISK_DEVICES) && (
              <DiskDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(NETWORK_DEVICES) && (
              <NetworkDevicesForm formik={formik} project={project} />
            )}

            {section === slugify(RESOURCE_LIMITS) && (
              <ResourceLimitsForm formik={formik} />
            )}

            {section === slugify(SECURITY_POLICIES) && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {section === slugify(SNAPSHOTS) && (
              <InstanceSnapshotsForm formik={formik} />
            )}

            {section === slugify(CLOUD_INIT) && (
              <CloudInitForm formik={formik} />
            )}

            {section === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                key={`yaml-form-${formik.values.readOnly}`}
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                readOnly={readOnly}
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
        {readOnly ? (
          <Button
            appearance="positive"
            disabled={!featuresProfiles}
            onClick={() => void formik.setFieldValue("readOnly", false)}
          >
            Edit profile
          </Button>
        ) : (
          <>
            <Button
              appearance="base"
              onClick={() => formik.setValues(getProfileEditValues(profile))}
            >
              Cancel
            </Button>
            <ActionButton
              appearance="positive"
              loading={formik.isSubmitting}
              disabled={
                !formik.isValid ||
                hasDiskError(formik) ||
                hasNetworkError(formik)
              }
              onClick={() => void formik.submitForm()}
            >
              Save changes
            </ActionButton>
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditProfile;
