import React, { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "api/profiles";
import { queryKeys } from "util/queryKeys";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import EditProfileForm from "pages/profiles/EditProfileForm";
import ProfileDetailOverview from "pages/profiles/ProfileDetailOverview";
import ProfileDetailHeader from "./ProfileDetailHeader";
import { slugify } from "util/slugify";
import { isProjectWithProfiles } from "util/projects";
import { useProject } from "context/project";
import NotificationRow from "components/NotificationRow";

const TABS: string[] = ["Overview", "Configuration"];

const ProfileDetail: FC = () => {
  const navigate = useNavigate();
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

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/project/${projectName}/profiles/detail/${name}`);
    } else {
      navigate(`/ui/project/${projectName}/profiles/detail/${name}/${newTab}`);
    }
  };

  return (
    <main className="l-main">
      <div className="p-panel profile-detail-page">
        <ProfileDetailHeader
          name={name}
          profile={profile}
          project={projectName}
          featuresProfiles={featuresProfiles}
        />
        <div className="p-panel__content">
          <NotificationRow />
          {isLoading && <Loader text="Loading profile details..." />}
          {!isLoading && !profile && <>Loading profile failed</>}
          {!isLoading && profile && (
            <Row>
              <Tabs
                links={TABS.map((tab) => ({
                  label: tab,
                  id: slugify(tab),
                  active:
                    slugify(tab) === activeTab ||
                    (tab === "Overview" && !activeTab),
                  onClick: () => handleTabChange(slugify(tab)),
                }))}
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
                  <EditProfileForm
                    profile={profile}
                    featuresProfiles={featuresProfiles}
                  />
                </div>
              )}
            </Row>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProfileDetail;
