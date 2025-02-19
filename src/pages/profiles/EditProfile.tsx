import { FC, useEffect, useState } from "react";
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
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormDeviceValues } from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
} from "components/forms/SecurityPoliciesForm";
import InstanceSnapshotsForm, {
  SnapshotFormValues,
} from "components/forms/InstanceSnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
} from "components/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
} from "components/forms/ResourceLimitsForm";
import YamlForm, { YamlFormValues } from "components/forms/YamlForm";
import { updateProfile } from "api/profiles";
import ProfileFormMenu, {
  BOOT,
  CLOUD_INIT,
  DISK_DEVICES,
  MAIN_CONFIGURATION,
  MIGRATION,
  NETWORK_DEVICES,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  GPU_DEVICES,
  OTHER_DEVICES,
} from "pages/profiles/forms/ProfileFormMenu";
import type { LxdProfile } from "types/profile";
import useEventListener from "util/useEventListener";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import ProfileDetailsForm, {
  ProfileDetailsFormValues,
} from "pages/profiles/forms/ProfileDetailsForm";
import { ensureEditMode, getProfileEditValues } from "util/instanceEdit";
import { slugify } from "util/slugify";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useDocs } from "context/useDocs";
import { getProfilePayload } from "util/profileEdit";
import MigrationForm, {
  MigrationFormValues,
} from "components/forms/MigrationForm";
import GPUDeviceForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import { PROXY_DEVICES } from "pages/instances/forms/InstanceFormMenu";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import ResourceLink from "components/ResourceLink";
import BootForm, { BootFormValues } from "components/forms/BootForm";
import { useProfileEntitlements } from "util/entitlements/profiles";

export type EditProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
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
  const [version, setVersion] = useState(0);
  const { canEditProfile } = useProfileEntitlements();

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

  const editRestriction = canEditProfile(profile)
    ? undefined
    : "You do not have permission to edit this profile";

  const formik = useFormik<EditProfileFormValues>({
    initialValues: getProfileEditValues(profile, editRestriction),
    validationSchema: ProfileSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const profilePayload = (
        values.yaml
          ? yamlToObject(values.yaml)
          : getProfilePayload(profile, values)
      ) as LxdProfile;

      // ensure the etag is set (it is missing on the yaml)
      profilePayload.etag = profile.etag;

      updateProfile(profilePayload, project)
        .then(() => {
          toastNotify.success(
            <>
              Profile{" "}
              <ResourceLink
                type="profile"
                value={profile.name}
                to={`/ui/project/${project}/profile/${profile.name}`}
              />{" "}
              updated.
            </>,
          );
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

  const updateSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project}/profile/${profile.name}/configuration`;
    if (newSection === MAIN_CONFIGURATION) {
      void navigate(baseUrl);
    } else {
      void navigate(`${baseUrl}/${slugify(newSection)}`);
    }
  };

  const getYaml = () => {
    const exclude = new Set(["used_by", "etag"]);
    const profilePayload = getProfilePayload(profile, formik.values);
    const bareProfile = Object.fromEntries(
      Object.entries(profilePayload).filter((e) => !exclude.has(e[0])),
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
        {section !== slugify(YAML_CONFIGURATION) && (
          <ProfileFormMenu
            active={section ?? slugify(MAIN_CONFIGURATION)}
            setActive={updateSection}
            isDisabled={false}
            formik={formik}
          />
        )}
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

            {section === slugify(GPU_DEVICES) && (
              <GPUDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(PROXY_DEVICES) && (
              <ProxyDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(OTHER_DEVICES) && (
              <OtherDeviceForm formik={formik} project={project} />
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

            {section === slugify(MIGRATION) && (
              <MigrationForm formik={formik} />
            )}

            {section === slugify(BOOT) && <BootForm formik={formik} />}

            {section === slugify(CLOUD_INIT) && (
              <CloudInitForm key={`yaml-form-${version}`} formik={formik} />
            )}

            {section === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                key={`yaml-form-${version}`}
                yaml={getYaml()}
                setYaml={(yaml) => {
                  ensureEditMode(formik);
                  void formik.setFieldValue("yaml", yaml);
                }}
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
        <YamlSwitch
          formik={formik}
          section={section}
          setSection={updateSection}
        />
        {readOnly ? null : (
          <>
            <Button
              appearance="base"
              onClick={() => {
                setVersion((old) => old + 1);
                void formik.setValues(getProfileEditValues(profile));
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={hasDiskError(formik) || hasNetworkError(formik)}
            />
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditProfile;
