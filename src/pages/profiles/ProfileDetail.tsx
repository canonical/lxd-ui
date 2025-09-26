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

  const { data: profile, error, isLoading } = useProfile(name, projectName);

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  return (
    <CustomLayout
      header={
        <ProfileDetailHeader
          name={name}
          profile={profile}
          project={projectName}
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
              <ProfileDetailOverview profile={profile} />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="configuration">
              <EditProfile profile={profile} />
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default ProfileDetail;
