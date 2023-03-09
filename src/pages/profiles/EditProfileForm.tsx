import React, { FC, useEffect, useState } from "react";
import { Col, Form, Notification, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import { useNotify } from "context/notify";
import DevicesForm, {
  devicePayload,
  DevicesFormValues,
} from "pages/instances/forms/DevicesForm";
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
import { parseCpuLimit, parseMemoryLimit } from "util/limits";
import { updateProfile } from "api/profiles";
import ProfileEditDetailsForm, {
  profileEditDetailPayload,
  ProfileEditDetailsFormValues,
} from "pages/profiles/forms/ProfileEditDetailsForm";
import ProfileFormMenu, {
  CLOUD_INIT,
  DEVICES,
  PROFILE_DETAILS,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
} from "pages/profiles/forms/ProfileFormMenu";
import { LxdProfile } from "types/profile";
import useEventListener from "@use-it/event-listener";
import { parseDevices } from "util/devices";
import { updateMaxHeight } from "util/updateMaxHeight";

export type EditProfileFormValues = ProfileEditDetailsFormValues &
  DevicesFormValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  CloudInitFormValues &
  YamlFormValues;

interface Props {
  profile: LxdProfile;
}

const EditProfileForm: FC<Props> = ({ profile }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(PROFILE_DETAILS);
  const [isConfigOpen, setConfigOpen] = useState(false);

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
    initialValues: {
      name: profile.name,
      description: profile.description,
      type: "profile",

      devices: parseDevices(profile.devices),

      limits_cpu: parseCpuLimit(profile.config["limits.cpu"]),
      limits_memory: parseMemoryLimit(profile.config["limits.memory"]),
      limits_memory_swap: profile.config["limits.memory.swap"],
      limits_disk_priority: profile.config["limits.disk.priority"]
        ? parseInt(profile.config["limits.disk.priority"])
        : undefined,
      limits_processes: profile.config["limits.processes"]
        ? parseInt(profile.config["limits.processes"])
        : undefined,

      security_protection_delete: profile.config["security.protection.delete"],
      security_privileged: profile.config["security.privileged"],
      security_protection_shift: profile.config["security.protection.shift"],
      security_idmap_base: profile.config["security.idmap.base"],
      security_idmap_size: profile.config["security.idmap.size"],
      security_idmap_isolated: profile.config["security.idmap.isolated"],
      security_devlxd: profile.config["security.devlxd"],
      security_devlxd_images: profile.config["security.devlxd.images"],
      security_secureboot: profile.config["security.secureboot"],
      snapshots_pattern: profile.config["snapshots.pattern"],
      snapshots_expiry: profile.config["snapshots.expiry"],
      snapshots_schedule: profile.config["snapshots.schedule"],
      snapshots_schedule_stopped: profile.config["snapshots.schedule.stopped"],
      ["cloud-init_network-config"]:
        profile.config["cloud-init.network-config"],
      ["cloud-init_user-data"]: profile.config["cloud-init.user-data"],
      ["cloud-init_vendor-data"]: profile.config["cloud-init.vendor-data"],
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      const profilePayload = values.yaml
        ? yamlToObject(values.yaml)
        : getPayload(values);

      updateProfile(JSON.stringify(profilePayload), project)
        .then(() => {
          navigate(
            `/ui/${project}/profiles/detail/${profile.name}`,
            notify.queue(notify.success(`Profile "${values.name}" saved.`))
          );
        })
        .catch((e: Error) => {
          notify.failure("Could not save", e);
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
    return {
      ...profileEditDetailPayload(values),
      ...devicePayload(values),
      config: {
        ...resourceLimitsPayload(values),
        ...securityPoliciesPayload(values),
        ...snapshotsPayload(values),
        ...cloudInitPayload(values),
      },
    };
  };

  const updateSection = (newItem: string) => {
    if (section === YAML_CONFIGURATION && newItem !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }
    setSection(newItem);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  const getYaml = () => {
    const exclude = new Set(["used_by"]);
    const bareProfile = Object.fromEntries(
      Object.entries(profile).filter((e) => !exclude.has(e[0]))
    );
    return dumpYaml(bareProfile);
  };

  const overrideNotification = (
    <Notification severity="caution" title="Before you add configurations">
      The custom configuration overrides any settings specified through
      profiles.
    </Notification>
  );

  return (
    <div className="edit-profile">
      <Form onSubmit={() => void formik.submitForm()} stacked className="form">
        <ProfileFormMenu
          active={section}
          setActive={updateSection}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
        />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {section === PROFILE_DETAILS && (
              <ProfileEditDetailsForm formik={formik} />
            )}

            {section === DEVICES && (
              <DevicesForm formik={formik} project={project}>
                {overrideNotification}
              </DevicesForm>
            )}

            {section === RESOURCE_LIMITS && (
              <ResourceLimitsForm formik={formik}>
                {overrideNotification}
              </ResourceLimitsForm>
            )}

            {section === SECURITY_POLICIES && (
              <SecurityPoliciesForm formik={formik}>
                {overrideNotification}
              </SecurityPoliciesForm>
            )}

            {section === SNAPSHOTS && (
              <SnapshotsForm formik={formik}>
                {overrideNotification}
              </SnapshotsForm>
            )}

            {section === CLOUD_INIT && <CloudInitForm formik={formik} />}

            {section === YAML_CONFIGURATION && (
              <YamlForm
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
              >
                <Notification
                  severity="caution"
                  title="Before you edit the YAML"
                >
                  Changes will be discarded, when switching back to the guided
                  forms.
                </Notification>
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid}
              buttonLabel="Save changes"
              onClick={() => void formik.submitForm()}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditProfileForm;
