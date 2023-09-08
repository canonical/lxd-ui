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
import YamlForm, { YamlFormValues } from "pages/instances/forms/YamlForm";
import { updateProfile } from "api/profiles";
import ProfileFormMenu, {
  CLOUD_INIT,
  STORAGE,
  PROFILE_DETAILS,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  NETWORKS,
} from "pages/profiles/forms/ProfileFormMenu";
import { LxdProfile } from "types/profile";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import RootStorageForm from "pages/instances/forms/RootStorageForm";
import NetworkForm from "pages/instances/forms/NetworkForm";
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
    newSection === PROFILE_DETAILS
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  const getYaml = () => {
    const exclude = new Set(["used_by", "etag"]);
    const bareProfile = Object.fromEntries(
      Object.entries(profile).filter((e) => !exclude.has(e[0]))
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
      <Form onSubmit={() => void formik.submitForm()} stacked className="form">
        <ProfileFormMenu
          active={activeSection ?? slugify(PROFILE_DETAILS)}
          setActive={updateSection}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
        />
        <Row className="form-contents" key={activeSection}>
          <Col size={12}>
            {(activeSection === slugify(PROFILE_DETAILS) || !activeSection) && (
              <ProfileDetailsForm formik={formik} isEdit={true} />
            )}

            {activeSection === slugify(STORAGE) && (
              <RootStorageForm formik={formik} project={project} />
            )}

            {activeSection === slugify(NETWORKS) && (
              <NetworkForm formik={formik} project={project} />
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
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {isReadOnly ? (
              <Button
                appearance="positive"
                disabled={!featuresProfiles}
                onClick={() => formik.setFieldValue("readOnly", false)}
              >
                Edit profile
              </Button>
            ) : (
              <>
                <Button
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
