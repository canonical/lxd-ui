import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import { useNotify } from "context/notify";
import { fetchProfile } from "api/profiles";
import ProfileLink from "./ProfileLink";
import { fetchProject } from "api/projects";
import { isProjectWithProfiles } from "util/projects";
import ExpandableList from "components/ExpandableList";
import { isDiskDevice, isNicDevice } from "util/devices";
import { getProfileInstances } from "util/usedBy";
import ProfileUsedByProject from "./ProfileUsedByProject";
import DetailPanel from "components/DetailPanel";

const ProfileDetailPanel: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const profileName = panelParams.profile;
  const projectName = panelParams.project;

  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, profileName, projectName],
    queryFn: () => fetchProfile(profileName ?? "", projectName),
  });

  const {
    data: project,
    error: projectError,
    isLoading: isProjectLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, projectName],
    queryFn: () => fetchProject(projectName),
  });

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  if (projectError) {
    notify.failure("Loading project failed", error);
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
      entityName="profile"
      entity={profile}
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
                {Object.values(profile.devices).some(isNicDevice) ? (
                  <ExpandableList
                    items={Object.values(profile.devices)
                      .filter(isNicDevice)
                      .map((device) => (
                        <div
                          key={device.network}
                          className="u-truncate list-item"
                          title={device.network}
                        >
                          {device.network}
                        </div>
                      ))}
                  />
                ) : (
                  <div className="list-item">-</div>
                )}
              </td>
            </tr>
            <tr className="u-no-border list-wrapper">
              <th className="u-text--muted last-of-section">Storage</th>
              <td>
                {Object.values(profile.devices).some(isDiskDevice) ? (
                  <ExpandableList
                    items={Object.values(profile.devices)
                      .filter(isDiskDevice)
                      .map((device) => (
                        <div
                          key={device.path}
                          className="u-truncate list-item"
                          title={device.pool}
                        >
                          {device.pool}
                        </div>
                      ))}
                  />
                ) : (
                  <div className="list-item">-</div>
                )}
              </td>
            </tr>
            <tr>
              <th colSpan={2}>
                <h3 className="p-muted-heading p-heading--5">
                  Used by ({usageCount})
                </h3>
              </th>
            </tr>
            <ProfileUsedByProject
              profile={profile}
              project={projectName}
              headingClassName="u-text--muted"
              hasTableParent
            />
            {usageCount === 0 && (
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
