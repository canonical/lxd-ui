import { FC } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "api/profiles";
import { queryKeys } from "util/queryKeys";
import { Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import EditProfile from "pages/profiles/EditProfile";
import ProfileDetailOverview from "pages/profiles/ProfileDetailOverview";
import ProfileDetailHeader from "./ProfileDetailHeader";
import { isProjectWithProfiles } from "util/projects";
import { useProject } from "context/project";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";

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

  const { project, isLoading: isProjectLoading } = useProject();

  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, "detail", name],
    queryFn: () => fetchProfile(name, projectName),
  });

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
      {isLoading && <Loader text="Loading profile details..." />}
      {!isLoading && !profile && <>Loading profile failed</>}
      {!isLoading && profile && (
        <Row>
          <TabLinks
            tabs={tabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${projectName}/profile/${name}`}
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
