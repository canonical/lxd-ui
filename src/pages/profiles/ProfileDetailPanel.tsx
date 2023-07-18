import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import { fetchProfile } from "api/profiles";
import ProfileLink from "./ProfileLink";
import { isProjectWithProfiles } from "util/projects";
import { getProfileInstances } from "util/usedBy";
import ProfileInstances from "./ProfileInstances";
import DetailPanel from "components/DetailPanel";
import ProfileNetworkList from "./ProfileNetworkList";
import ProfileStorageList from "./ProfileStorageList";
import { useProject } from "context/project";
import { useNotify } from "@canonical/react-components";

const ProfileDetailPanel: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const profileName = panelParams.profile;
  const projectName = panelParams.project;

  const { project, isLoading: isProjectLoading } = useProject();

  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, profileName, projectName],
    queryFn: () => fetchProfile(profileName ?? "", projectName),
  });

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  const isLoading = isProfileLoading || isProjectLoading;

  const featuresProfiles = isProjectWithProfiles(project);

  const isDefaultProject = projectName === "default";
  const usageCount = getProfileInstances(
    projectName,
    isDefaultProject,
    profile?.used_by
  ).length;

  return (
    <DetailPanel
      title="Profile summary"
      hasLoadingError={!profile}
      className="profile-detail-panel"
      isLoading={isLoading}
    >
      {profile && (
        <table className="u-table-layout--auto u-no-margin--bottom">
          <tbody>
            <tr>
              <th className="u-text--muted">Name</th>
              <td>
                <ProfileLink
                  profile={{ name: profile.name, project: projectName }}
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
                <ProfileNetworkList profile={profile} />
              </td>
            </tr>
            <tr className="u-no-border list-wrapper">
              <th className="u-text--muted last-of-section">Storage</th>
              <td>
                <ProfileStorageList profile={profile} />
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
                project={projectName}
                headingClassName="u-text--muted"
              />
            ) : (
              <tr>
                <td colSpan={2}>No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </DetailPanel>
  );
};

export default ProfileDetailPanel;
