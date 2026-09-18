import { useState, type FC } from "react";
import { useFormik } from "formik";
import {
  ActionButton,
  Button,
  failure,
  Form,
  Input,
  Modal,
  Notification,
  RadioInput,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { getUniqueResourceName, truncateEntityName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import ResourceLink from "components/ResourceLink";
import type { LxdProfile } from "types/profile";
import { useProfiles } from "context/useProfiles";
import { createProfile, fetchProfile, updateProfile } from "api/profiles";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useAuth } from "context/auth";
import { profileNameValidation } from "util/profiles";
import { useEventQueue } from "context/eventQueue";
import type { NotificationType } from "@canonical/react-components/dist/components/NotificationProvider/types";
import { useProfileEntitlements } from "util/entitlements/profiles";

interface Props {
  profile: LxdProfile;
  close: () => void;
}

export interface LxdProfileCopy {
  profileName: string;
  targetProject: string;
  isRefresh: boolean;
}

const CopyProfileForm: FC<Props> = ({ profile, close }) => {
  const toastNotify = useToastNotification();
  const sourceProject = profile.project ?? "default";
  const navigate = useNavigate();
  const controllerState = useState<AbortController | null>(null);
  const { data: profiles = [] } = useProfiles(sourceProject);
  const { isFineGrained } = useAuth();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { canCreateProfiles } = useProjectEntitlements();
  const { canEditProfile } = useProfileEntitlements();
  const eventQueue = useEventQueue();
  const [error, setError] = useState<NotificationType | null>(null);

  const notifySuccess = (name: string, project: string, isRefresh: boolean) => {
    const profileURL = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(name)}`;
    const verb = isRefresh ? "Refreshed" : "Created";

    const message = (
      <>
        {verb} profile{" "}
        <ResourceLink type={"profile"} value={name} to={profileURL} />.
      </>
    );
    const actions = [
      {
        label: "Configure",
        onClick: async () => navigate(`${profileURL}/configuration`),
      },
    ];
    toastNotify.success(message, actions);
    close();
  };

  const getCopiedProfileName = (oldProfileName: string): string => {
    const newProfileName = truncateEntityName(oldProfileName, "-copy");
    return getUniqueResourceName(newProfileName, profiles);
  };

  const refreshProfile = async (values: LxdProfileCopy) => {
    const targetProfile = await fetchProfile(
      values.profileName,
      values.targetProject,
      isFineGrained,
    );

    return updateProfile(
      {
        ...targetProfile,
        description: profile.description,
        config: profile.config,
        devices: profile.devices,
      },
      values.targetProject,
    ).then((operation) => {
      eventQueue.set(
        operation.metadata.id,
        () => {
          notifySuccess(values.profileName, values.targetProject, true);
        },
        (msg) => {
          setError(failure(`Profile refresh failed.`, new Error(msg)));
          formik.setSubmitting(false);
        },
      );
    });
  };

  const copyProfile = (values: LxdProfileCopy) => {
    createProfile(
      JSON.stringify({
        name: values.profileName,
        description: profile.description,
        config: profile.config,
        devices: profile.devices,
      }),
      values.targetProject,
    )
      .then(() => {
        notifySuccess(values.profileName, values.targetProject, false);
      })
      .catch((e) => {
        setError(failure(`Profile copy failed.`, e));
        formik.setSubmitting(false);
      });
  };

  const formik = useFormik<LxdProfileCopy>({
    initialValues: {
      profileName: getCopiedProfileName(profile.name),
      targetProject: canCreateProfiles(
        projects.find((p) => p.name === sourceProject),
      )
        ? sourceProject
        : "",
      isRefresh: false,
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      targetProject: Yup.string().required("This field is required"),
      profileName: profileNameValidation(
        profile.project ?? "default",
        controllerState,
      ).required(),
    }),
    onSubmit: (values) => {
      if (values.isRefresh) {
        refreshProfile(values).catch((e) => {
          setError(failure(`Profile refresh failed.`, e));
          formik.setSubmitting(false);
        });
      } else {
        copyProfile(values);
      }
    },
  });

  const { data: targetProfiles = [], isLoading: isTargetProfilesLoading } =
    useProfiles(formik.values.targetProject);

  const refreshProfiles = targetProfiles
    .filter(canEditProfile)
    .filter((candidate) => {
      return (
        profile.name !== candidate.name ||
        sourceProject !== formik.values.targetProject
      );
    });

  return (
    <Modal
      close={close}
      className="copy-instances-modal"
      title="Copy or refresh profile"
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={
              !formik.isValid ||
              formik.isSubmitting ||
              projectsLoading ||
              isTargetProfilesLoading
            }
            onClick={() => void formik.submitForm()}
          >
            {formik.values.isRefresh ? "Refresh profile" : "Copy profile"}
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        {error && (
          <Notification
            title={error.title}
            severity="negative"
            onDismiss={() => {
              setError(null);
            }}
          >
            {error.message}
          </Notification>
        )}
        <div className="u-sv1">
          <RadioInput
            label="Copy this profile"
            checked={!formik.values.isRefresh}
            onChange={() => {
              void formik.setFieldValue("isRefresh", false, false);
              void formik.setFieldValue(
                "profileName",
                getCopiedProfileName(profile.name),
                true,
              );
            }}
          />
        </div>
        <div className="u-sv3">
          <RadioInput
            label="Refresh another profile with the contents of this profile"
            checked={formik.values.isRefresh}
            onChange={() => {
              void formik.setFieldValue("isRefresh", true, false);
              void formik.setFieldValue("profileName", "", true);
            }}
          />
        </div>
        <Select
          {...formik.getFieldProps("targetProject")}
          id="targetProject"
          label="Target project"
          options={[
            {
              label: "Select a project",
              value: "",
              disabled: true,
            },
            ...projects
              .filter((project) => {
                if (formik.values.isRefresh) {
                  return true;
                } else {
                  return canCreateProfiles(project);
                }
              })
              .map((project) => {
                return {
                  label: project.name,
                  value: project.name,
                };
              }),
          ]}
          onChange={(e) => {
            formik.setFieldValue("targetProject", e.target.value, false);
            if (formik.values.isRefresh) {
              void formik.setFieldValue("profileName", "", true);
            } else {
              void formik.setFieldValue(
                "profileName",
                getCopiedProfileName(profile.name),
                true,
              );
            }
          }}
        />
        {formik.values.isRefresh ? (
          <Select
            {...formik.getFieldProps("profileName")}
            id="profileName"
            label="Profile to refresh"
            options={[
              {
                label:
                  refreshProfiles.length > 0
                    ? "Select profile"
                    : "No profile available",
                value: "",
                disabled: true,
              },
              ...refreshProfiles.map((item) => {
                return {
                  label: item.name,
                  value: item.name,
                };
              }),
            ]}
            disabled={refreshProfiles.length === 0}
          />
        ) : (
          <Input
            {...formik.getFieldProps("profileName")}
            type="text"
            label="New profile name"
            error={
              formik.touched.profileName ? formik.errors.profileName : undefined
            }
          />
        )}
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default CopyProfileForm;
