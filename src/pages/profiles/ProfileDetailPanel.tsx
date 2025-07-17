import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useCurrentProject } from "context/useCurrentProject";
import {
  Button,
  Icon,
  useNotify,
  SidePanel,
} from "@canonical/react-components";
import ProfileDetailPanelContent from "./ProfileDetailPanelContent";
import { useProfile } from "context/useProfiles";

const ProfileDetailPanel: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const profileName = panelParams.profile;
  const projectName = panelParams.project;

  const { project, isLoading: isProjectLoading } = useCurrentProject();

  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useProfile(profileName ?? "", projectName);

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  const isLoading = isProfileLoading || isProjectLoading;

  return (
    <SidePanel
      loading={isLoading}
      hasError={!profile || !project}
      className="u-hide--medium u-hide--small detail-panel profile-detail-panel"
      pinned
    >
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
    </SidePanel>
  );
};

export default ProfileDetailPanel;
