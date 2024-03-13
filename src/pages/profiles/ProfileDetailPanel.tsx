import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import { fetchProfile } from "api/profiles";
import { useProject } from "context/project";
import { Button, Icon, useNotify } from "@canonical/react-components";
import SidePanel from "components/SidePanel";
import ProfileDetailPanelContent from "./ProfileDetailPanelContent";

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

  return (
    <SidePanel
      loading={isLoading}
      hasError={!profile || !project}
      className="u-hide--medium u-hide--small"
      width="narrow"
      pinned
    >
      <SidePanel.Container className="detail-panel profile-detail-panel">
        <SidePanel.Sticky>
          <SidePanel.Header>
            <SidePanel.HeaderTitle>Profile summary</SidePanel.HeaderTitle>
            <SidePanel.HeaderControls>
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                hasIcon
                onClick={panelParams.clear}
                aria-label="Close"
              >
                <Icon name="close" />
              </Button>
            </SidePanel.HeaderControls>
          </SidePanel.Header>
        </SidePanel.Sticky>
        <SidePanel.Content>
          {!!(profile && project) && (
            <ProfileDetailPanelContent profile={profile} project={project} />
          )}
        </SidePanel.Content>
      </SidePanel.Container>
    </SidePanel>
  );
};

export default ProfileDetailPanel;
