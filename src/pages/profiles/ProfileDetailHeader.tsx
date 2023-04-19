import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import { LxdProfile } from "types/profile";
import RenameHeader from "components/RenameHeader";
import { renameProfile } from "api/profiles";
import { useNotify } from "context/notify";

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
  const [isSubmitting, setSubmitting] = useState(false);

  const handleRename = (newName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (name === newName) {
        return resolve();
      }
      setSubmitting(true);
      renameProfile(name, newName, project)
        .then(() => {
          navigate(
            `/ui/${project}/profiles/detail/${newName}`,
            notify.queue(notify.success("Profile renamed."))
          );
          return resolve();
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
          reject();
        })
        .finally(() => setSubmitting(false));
    });
  };

  return (
    <RenameHeader
      name={name}
      parentItem={<Link to={`/ui/${project}/profiles`}>Profiles</Link>}
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
      onRename={handleRename}
      isRenaming={isSubmitting}
    />
  );
};

export default ProfileDetailHeader;
