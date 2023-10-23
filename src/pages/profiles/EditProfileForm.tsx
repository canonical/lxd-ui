import React, { FC, useEffect, useState } from "react";
import {
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
import SubmitButton from "components/SubmitButton";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormDeviceValues, formDeviceToPayload } from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
  securityPoliciesPayload,
} from "components/forms/SecurityPoliciesForm";
import SnapshotsForm, {
  SnapshotFormValues,
  snapshotsPayload,
} from "components/forms/SnapshotsForm";
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

const EditProfileForm: FC<Props> = ({ profile, featuresProfiles }) => {
  const notify = useNotify();
  const { project, activeSection } = useParams<{
    project: string;
    activeSection?: string;
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
  useEffect(updateFormHeight, [notify.notification?.message, activeSection]);
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
          notify.success("Profile updated.");
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
    if (Boolean(formik.values.yaml) && newSection !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }

    const baseUrl = `/ui/project/${project}/profiles/detail/${profile.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  const getYaml = () => {
    const exclude = new Set(["used_by", "etag"]);
    const bareProfile = Object.fromEntries(
      Object.entries(profile).filter((e) => !exclude.has(e[0])),
    );
    return dumpYaml(bareProfile);
  };

  const isReadOnly = formik.values.readOnly;

  return (
    <div className="edit-profile">
      {!featuresProfiles && (
        <Notification severity="caution" title="Inherited profile">
          Modifications are only available in the{" "}
          <Link
            to={`/ui/project/default/profiles/detail/${profile.name}/configuration`}
          >
            default project
          </Link>
          .
        </Notification>
      )}
      <Form onSubmit={formik.handleSubmit} stacked className="form">
        <ProfileFormMenu
          active={activeSection ?? slugify(MAIN_CONFIGURATION)}
          setActive={updateSection}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
          hasName={true}
        />
        <Row className="form-contents" key={activeSection}>
          <Col size={12}>
            {(activeSection === slugify(MAIN_CONFIGURATION) ||
              !activeSection) && (
              <ProfileDetailsForm formik={formik} isEdit={true} />
            )}

            {activeSection === slugify(DISK_DEVICES) && (
              <DiskDeviceForm formik={formik} project={project} />
            )}

            {activeSection === slugify(NETWORK_DEVICES) && (
              <NetworkDevicesForm formik={formik} project={project} />
            )}

            {activeSection === slugify(RESOURCE_LIMITS) && (
              <ResourceLimitsForm formik={formik} />
            )}

            {activeSection === slugify(SECURITY_POLICIES) && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {activeSection === slugify(SNAPSHOTS) && (
              <SnapshotsForm formik={formik} />
            )}

            {activeSection === slugify(CLOUD_INIT) && (
              <CloudInitForm formik={formik} />
            )}

            {activeSection === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                isReadOnly={isReadOnly}
              >
                {!isReadOnly && (
                  <Notification
                    severity="caution"
                    title="Before you edit the YAML"
                  >
                    Changes will be discarded, when switching back to the guided
                    forms.
                  </Notification>
                )}
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <div className="p-bottom-controls" id="form-footer">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {isReadOnly ? (
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
                  onClick={() =>
                    formik.setValues(getProfileEditValues(profile))
                  }
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid}
                  buttonLabel="Save changes"
                  onClick={() => void formik.submitForm()}
                />
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditProfileForm;
