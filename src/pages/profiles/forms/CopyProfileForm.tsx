import { useState, type FC } from "react";
import { useFormik } from "formik";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { getUniqueResourceName, truncateEntityName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import ResourceLink from "components/ResourceLink";
import type { LxdProfile } from "types/profile";
import { useProfiles } from "context/useProfiles";
import ProfileLink from "../ProfileLink";
import { createProfile } from "api/profiles";
import { profileNameValidation } from "util/profiles";

interface Props {
  profile: LxdProfile;
  close: () => void;
}

export interface LxdInstanceCopy {
  profileName: string;
}

const CopyProfileForm: FC<Props> = ({ profile, close }) => {
  const toastNotify = useToastNotification();
  const navigate = useNavigate();
  const controllerState = useState<AbortController | null>(null);
  const { data: profiles = [] } = useProfiles(profile?.project ?? "");

  const notifySuccess = (name: string, project: string) => {
    const profileURL = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(name)}`;
    const message = (
      <>
        Created profile{" "}
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
  };

  const getCopiedProfileName = (oldProfileName: string): string => {
    const newProfileName = truncateEntityName(oldProfileName, "-copy");
    return getUniqueResourceName(newProfileName, profiles);
  };

  const formik = useFormik<LxdInstanceCopy>({
    initialValues: {
      profileName: getCopiedProfileName(profile.name),
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      profileName: profileNameValidation(
        profile.project ?? "default",
        controllerState,
      ).required(),
    }),
    onSubmit: (values) => {
      const profileLink = <ProfileLink profile={profile} />;
      createProfile(
        JSON.stringify({
          name: values.profileName,
          description: profile.description,
          config: profile.config,
          devices: profile.devices,
        }),
        profile.project ?? "",
      )
        .then(() => {
          notifySuccess(values.profileName, profile.project ?? "");
        })
        .catch((e) => {
          toastNotify.failure("Profile copy failed.", e, profileLink);
        })
        .finally(() => {
          close();
        });
    },
  });

  return (
    <Modal
      close={close}
      className="copy-instances-modal"
      title="Copy Profile"
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
            disabled={!formik.isValid || formik.isSubmitting}
            onClick={() => void formik.submitForm()}
          >
            Copy
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Input
          {...formik.getFieldProps("profileName")}
          type="text"
          label="New profile name"
          error={formik.touched.profileName ? formik.errors.profileName : null}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default CopyProfileForm;
