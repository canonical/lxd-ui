import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import { LxdProfile } from "types/profile";
import ProfileRename from "pages/profiles/forms/ProfileRename";
import { Tooltip } from "@canonical/react-components";

interface Props {
  name: string;
  profile?: LxdProfile;
  project: string;
}

const ProfileDetailHeader: FC<Props> = ({ name, profile, project }) => {
  const [isRename, setRename] = useState(false);
  const canRename = profile && profile.name !== "default";

  return (
    <div className="p-panel__header">
      <h1 className="u-off-screen">{name}</h1>
      {profile ? (
        <div className="p-panel__title">
          <nav
            key="breadcrumbs"
            className="p-breadcrumbs"
            aria-label="Breadcrumbs"
          >
            <ol className="p-breadcrumbs__items">
              <li className="p-breadcrumbs__item">
                <Link to={`/ui/${project}/profiles`}>Profiles</Link>
              </li>
              {isRename ? (
                <li className="p-breadcrumbs__item profile-rename">
                  <ProfileRename
                    profile={profile}
                    project={project}
                    closeForm={() => setRename(false)}
                  />
                </li>
              ) : (
                <li
                  className="p-breadcrumbs__item profile-name u-truncate"
                  onClick={() => canRename && setRename(true)}
                  title={name}
                >
                  <Tooltip
                    message={!canRename && "Cannot rename the default profile"}
                    position="btm-left"
                  >
                    {name}
                  </Tooltip>
                </li>
              )}
            </ol>
          </nav>
        </div>
      ) : (
        <h4 className="p-panel__title">{name}</h4>
      )}
      {profile && !isRename && (
        <div className="p-panel__controls">
          <DeleteProfileBtn profile={profile} project={project} />
        </div>
      )}
    </div>
  );
};

export default ProfileDetailHeader;
