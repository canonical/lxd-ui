import { FC } from "react";
import type { LxdProfile } from "types/profile";
import ProfileLink from "./ProfileLink";
import { getProfileInstances } from "util/usedBy";
import ProfileNetworkList from "./ProfileNetworkList";
import ProfileStorageList from "./ProfileStorageList";
import ProfileInstances from "./ProfileInstances";
import type { LxdProject } from "types/project";
import { isProjectWithProfiles } from "util/projects";

interface Props {
  profile: LxdProfile;
  project: LxdProject;
}

const ProfileDetailPanelContent: FC<Props> = ({ profile, project }) => {
  const isDefaultProject = project.name === "default";
  const usageCount = getProfileInstances(
    project.name,
    isDefaultProject,
    profile.used_by,
  ).length;

  const featuresProfiles = isProjectWithProfiles(project);

  return (
    <table className="u-table-layout--auto u-no-margin--bottom">
      <tbody>
        <tr>
          <th className="u-text--muted">Name</th>
          <td>
            <ProfileLink
              profile={{ name: profile.name, project: project.name }}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Description</th>
          <td>{profile.description ? profile.description : "-"}</td>
        </tr>
        <tr>
          <th className="u-text--muted last-of-section">Defined in</th>
          <td>{featuresProfiles ? "Current" : "Default"} project</td>
        </tr>
        <tr className="u-no-border">
          <th colSpan={2}>
            <h3 className="p-muted-heading p-heading--5">Devices</h3>
          </th>
        </tr>
        <tr className="u-no-border list-wrapper">
          <th className="u-text--muted">Networks</th>
          <td>
            <ProfileNetworkList profile={profile} project={project.name} />
          </td>
        </tr>
        <tr className="u-no-border list-wrapper">
          <th className="u-text--muted last-of-section">Storage</th>
          <td>
            <ProfileStorageList profile={profile} project={project.name} />
          </td>
        </tr>
        <tr className="used-by-header">
          <th colSpan={2}>
            <h3 className="p-muted-heading p-heading--5">
              Used by ({usageCount})
            </h3>
          </th>
        </tr>
        {usageCount > 0 ? (
          <ProfileInstances
            profile={profile}
            project={project.name}
            headingClassName="u-text--muted"
          />
        ) : (
          <tr>
            <td colSpan={2}>No items found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProfileDetailPanelContent;
