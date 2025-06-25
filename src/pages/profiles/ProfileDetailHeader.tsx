import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import type { LxdProfile } from "types/profile";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { renameProfile } from "api/profiles";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { useNotify, useToastNotification } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { useProfileEntitlements } from "util/entitlements/profiles";

interface Props {
  name: string;
  profile?: LxdProfile;
  project: string;
  featuresProfiles: boolean;
}

const ProfileDetailHeader: FC<Props> = ({
  name,
  profile,
  project,
  featuresProfiles,
}) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditProfile } = useProfileEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A profile with this name already exists",
        async (value) =>
          profile?.name === value ||
          checkDuplicateName(value, project, controllerState, "profiles"),
      )
      .required("Profile name is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameProfile(name, values.name, project)
        .then(() => {
          navigate(
            `/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(values.name)}`,
          );
          toastNotify.success(
            <>
              Profile <strong>{name}</strong> renamed to{" "}
              <ResourceLink
                type="profile"
                value={values.name}
                to={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(values.name)}`}
              />
              .
            </>,
          );
          formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const getRenameDisabledReason = () => {
    if (!canEditProfile(profile)) {
      return "You do not have permission to rename this profile";
    }

    if (profile && profile.name === "default") {
      return "Cannot rename the default profile";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link
          to={`/ui/project/${encodeURIComponent(project)}/profiles`}
          key={1}
        >
          Profiles
        </Link>,
      ]}
      renameDisabledReason={getRenameDisabledReason()}
      controls={
        profile && (
          <DeleteProfileBtn
            key="delete"
            profile={profile}
            project={project}
            featuresProfiles={featuresProfiles}
          />
        )
      }
      isLoaded={Boolean(profile)}
      formik={formik}
    />
  );
};

export default ProfileDetailHeader;
