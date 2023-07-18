import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import { LxdProfile } from "types/profile";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { renameProfile } from "api/profiles";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { useNotify } from "@canonical/react-components";

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
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A profile with this name already exists",
        (value) =>
          profile?.name === value ||
          checkDuplicateName(value, project, controllerState, "profiles")
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
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameProfile(name, values.name, project)
        .then(() => {
          navigate(
            `/ui/project/${project}/profiles/detail/${values.name}`,
            notify.queue(notify.success("Profile renamed."))
          );
          void formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <RenameHeader
      name={name}
      parentItem={<Link to={`/ui/project/${project}/profiles`}>Profiles</Link>}
      renameDisabledReason={
        profile && profile.name === "default"
          ? "Cannot rename the default profile"
          : undefined
      }
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
