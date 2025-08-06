import type { FC } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import EditProfile from "pages/profiles/EditProfile";
import ProfileDetailOverview from "pages/profiles/ProfileDetailOverview";
import ProfileDetailHeader from "./ProfileDetailHeader";
import { isProjectWithProfiles } from "util/projects";
import { useCurrentProject } from "context/useCurrentProject";
import NotificationRow from "components/NotificationRow";
import TabLinks from "components/TabLinks";
import { useProfile } from "context/useProfiles";

const tabs: string[] = ["Overview", "Configuration"];

const ProfileDetail: FC = () => {
  const notify = useNotify();
  const {
    name,
    project: projectName,
    activeTab,
  } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!projectName) {
    return <>Missing project</>;
  }

  const { project, isLoading: isProjectLoading } = useCurrentProject();

  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useProfile(name, projectName);

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  const isLoading = isProfileLoading || isProjectLoading;

  const featuresProfiles = isProjectWithProfiles(project);

  return (
    <CustomLayout
      header={
        <ProfileDetailHeader
          name={name}
          profile={profile}
          project={projectName}
          featuresProfiles={featuresProfiles}
        />
      }
      contentClassName="detail-page"
    >
      <NotificationRow />
      {isLoading && (
        <Spinner className="u-loader" text="Loading profile details..." />
      )}
      {!isLoading && !profile && <>Loading profile failed</>}
      {!isLoading && profile && (
        <Row>
          <TabLinks
            tabs={tabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${encodeURIComponent(projectName)}/profile/${encodeURIComponent(name)}`}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="overview">
              <ProfileDetailOverview
                profile={profile}
                featuresProfiles={featuresProfiles}
              />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="configuration">
              <EditProfile
                profile={profile}
                featuresProfiles={featuresProfiles}
              />
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default ProfileDetail;
