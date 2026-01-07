import type { FC } from "react";
import type { LxdProfile } from "types/profile";
import ProfileLink from "./ProfileLink";
import { getProfileInstances } from "util/usedBy";
import ProfileNetworkList from "./ProfileNetworkList";
import ProfileInstances from "./ProfileInstances";
import DevicesSummaryList from "components/DevicesSummaryList";
import type { LxdProject } from "types/project";
import { isProjectWithProfiles } from "util/projects";
import { getDefaultStoragePool } from "util/helpers";
import ProfileConfigurationSections from "pages/profiles/ProfileConfigurationSections";
import ProfileResourceLimits from "pages/profiles/ProfileResourceLimits";
import StoragePoolRichChip from "pages/storage/StoragePoolRichChip";

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
  const defaultStoragePool = getDefaultStoragePool(profile);

  return (
    <table className="u-table-layout--auto u-no-margin--bottom">
      <tbody>
        <tr>
          <th className="u-text--muted">Name</th>
          <td>
            <ProfileLink profile={profile} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Description</th>
          <td>{profile.description ? profile.description : "-"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Defined in</th>
          <td>{featuresProfiles ? "Current" : "Default"} project</td>
        </tr>
        <tr>
          <th className="u-text--muted">Root storage</th>
          <td>
            {defaultStoragePool ? (
              <StoragePoolRichChip
                poolName={defaultStoragePool}
                projectName={project.name}
              />
            ) : (
              "-"
            )}
          </td>
        </tr>
        <tr className="list-wrapper">
          <th className="u-text--muted">Networks</th>
          <td>
            <ProfileNetworkList profile={profile} project={project.name} />
          </td>
        </tr>
        <tr className="list-wrapper">
          <th className="u-text--muted">Devices</th>
          <td>
            <DevicesSummaryList devices={Object.values(profile.devices)} />
          </td>
        </tr>
        <tr className="list-wrapper">
          <th className="u-text--muted">Limits</th>
          <td>
            <ProfileResourceLimits profile={profile} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Configuration</th>
          <td>
            <ProfileConfigurationSections profile={profile} />
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
