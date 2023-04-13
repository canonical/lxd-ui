import React, { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "api/profiles";
import NotificationRow from "components/NotificationRow";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import { Row, Tabs } from "@canonical/react-components";
import Loader from "components/Loader";
import EditProfileForm from "pages/profiles/EditProfileForm";
import ProfileDetailOverview from "pages/profiles/ProfileDetailOverview";
import ProfileDetailHeader from "./ProfileDetailHeader";
import { slugify } from "util/slugify";
import { fetchProject } from "api/projects";

const TABS: string[] = ["Overview", "Configuration"];

const ProfileDetail: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, "detail", name],
    queryFn: () => fetchProfile(name, project),
  });

  const {
    data: projectObj,
    error: projectError,
    isLoading: isProjectLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, project],
    queryFn: () => fetchProject(project),
  });

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  if (projectError) {
    notify.failure("Loading project failed", error);
  }
  const isLoading = isProfileLoading || isProjectLoading;

  const featuresProfiles = projectObj?.config["features.profiles"] === "true";

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/${project}/profiles/detail/${name}`);
    } else {
      navigate(`/ui/${project}/profiles/detail/${name}/${newTab}`);
    }
  };

  return (
    <main className="l-main">
      <div className="p-panel profile-detail-page">
        <ProfileDetailHeader
          name={name}
          profile={profile}
          project={project}
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
