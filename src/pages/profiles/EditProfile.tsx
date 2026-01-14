import type { FC } from "react";
import { useEffect, useState } from "react";
import {
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
import { objectToYaml, yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import type { FormDeviceValues } from "util/formDevices";
import type { SecurityPoliciesFormValues } from "components/forms/SecurityPoliciesForm";
import SecurityPoliciesForm from "components/forms/SecurityPoliciesForm";
import type { SnapshotFormValues } from "components/forms/InstanceSnapshotsForm";
import InstanceSnapshotsForm from "components/forms/InstanceSnapshotsForm";
import type { CloudInitFormValues } from "components/forms/CloudInitForm";
import CloudInitForm from "components/forms/CloudInitForm";
import type { ResourceLimitsFormValues } from "components/forms/ResourceLimitsForm";
import ResourceLimitsForm from "components/forms/ResourceLimitsForm";
import type { YamlFormValues } from "components/forms/YamlForm";
import YamlForm from "components/forms/YamlForm";
import { updateProfile } from "api/profiles";
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
import type { LxdProfile } from "types/profile";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm/NetworkDevicesForm";
import type { ProfileDetailsFormValues } from "pages/profiles/forms/ProfileDetailsForm";
import ProfileDetailsForm from "pages/profiles/forms/ProfileDetailsForm";
import { ensureEditMode, getProfileEditValues } from "util/instanceEdit";
import { slugify } from "util/slugify";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import type { MigrationFormValues } from "components/forms/MigrationForm";
import MigrationForm from "components/forms/MigrationForm";
import GPUDeviceForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import ProfileRichChip from "pages/profiles/ProfileRichChip";
import type { BootFormValues } from "components/forms/BootForm";
import BootForm from "components/forms/BootForm";
import { useProfileEntitlements } from "util/entitlements/profiles";
import type { SshKeyFormValues } from "components/forms/SshKeyForm";
import { useEventQueue } from "context/eventQueue";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { getProfilePayload } from "util/profiles";
import usePanelParams, { panels } from "util/usePanelParams";
import NetworkDevicePanel from "components/forms/NetworkDevicesForm/edit/NetworkDevicePanel";

export type EditProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

interface Props {
  profile: LxdProfile;
}

const EditProfile: FC<Props> = ({ profile }) => {
  const notify = useNotify();
  const eventQueue = useEventQueue();
  const { hasStorageAndProfileOperations } = useSupportedFeatures();
  const toastNotify = useToastNotification();
  const { project, section } = useParams<{
    project: string;
    section?: string;
  }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const { canEditProfile } = useProfileEntitlements();
  const panelParams = usePanelParams();

  if (!project) {
    return <>Missing project</>;
  }

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useListener(window, updateFormHeight, "resize", true);

  const ProfileSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });

  const editRestriction = canEditProfile(profile)
    ? undefined
    : "You do not have permission to edit this profile";

  const handleSuccess = (profilePayload: LxdProfile) => {
    toastNotify.success(
      <>
        Profile{" "}
        <ProfileRichChip profileName={profile.name} projectName={project} />{" "}
        updated.
      </>,
    );
    formik.resetForm({
      values: getProfileEditValues(profilePayload),
    });
  };

  const handleFailure = (e: Error) => {
    notify.failure("Profile update failed", e);
  };

  const handleFinish = () => {
    formik.setSubmitting(false);
    queryClient.invalidateQueries({
      queryKey: [queryKeys.profiles],
    });
  };

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
        .then((operation) => {
          if (hasStorageAndProfileOperations) {
            eventQueue.set(
              operation.metadata.id,
              () => {
                handleSuccess(profilePayload);
              },
              (msg) => {
                handleFailure(new Error(msg));
              },
              handleFinish,
            );
          } else {
            handleSuccess(profilePayload);
            handleFinish();
          }
        })
        .catch(handleFailure);
    },
  });

  const baseUrl = `/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(profile.name)}/configuration`;

  const updateSection = (newSection: string) => {
    if (newSection === MAIN_CONFIGURATION) {
      navigate(baseUrl);
    } else {
      navigate(`${baseUrl}/${slugify(newSection)}`);
    }
  };

  const getYaml = () => {
    const exclude = new Set(["used_by", "etag"]);
    const profilePayload = getProfilePayload(profile, formik.values);
    const bareProfile = Object.fromEntries(
      Object.entries(profilePayload).filter((e) => !exclude.has(e[0])),
    );
    return objectToYaml(bareProfile);
  };

  const readOnly = formik.values.readOnly;

  return (
    <div className="edit-profile">
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
              <ProfileDetailsForm
                formik={formik}
                isEdit={true}
                project={project}
              />
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
              <CloudInitForm
                key={`yaml-form-${version}`}
                formik={formik}
                project={project}
              />
            )}

            {section === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                key={`yaml-form-${version}`}
                yaml={getYaml()}
                setYaml={(yaml) => {
                  ensureEditMode(formik);
                  formik.setFieldValue("yaml", yaml);
                }}
                readOnly={!!formik.values.editRestriction}
                readOnlyMessage={formik.values.editRestriction}
              >
                <YamlNotification entity="profile" docPath="/profiles" />
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
                formik.resetForm({
                  values: getProfileEditValues(profile),
                });
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              baseUrl={baseUrl}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={hasDiskError(formik) || hasNetworkError(formik)}
            />
          </>
        )}
      </FormFooterLayout>

      {(panelParams.panel === panels.editNetworkDevice ||
        panelParams.panel === panels.createNetworkDevice) && (
        <NetworkDevicePanel
          project={project}
          formik={formik}
          onSave={() => {
            ensureEditMode(formik);
          }}
        />
      )}
    </div>
  );
};

export default EditProfile;
