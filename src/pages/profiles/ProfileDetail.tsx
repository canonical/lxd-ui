import React, { FC, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "api/profiles";
import NotificationRow from "components/NotificationRow";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import { Row, Tabs, Tooltip } from "@canonical/react-components";
import Loader from "components/Loader";
import EditProfileForm from "pages/profiles/EditProfileForm";
import ProfileDetailOverview from "pages/profiles/ProfileDetailOverview";
import ProfileRename from "pages/profiles/forms/ProfileRename";

const TABS: string[] = ["Overview", "Configuration"];

const tabNameToUrl = (name: string) => {
  return name.replace(" ", "-").toLowerCase();
};

const ProfileDetail: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();
  const [controlTarget, setControlTarget] = useState<HTMLSpanElement | null>();
  const [isRename, setRename] = useState(false);

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: profile,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, "detail", name],
    queryFn: () => fetchProfile(name, project),
  });

  if (error) {
    notify.failure("Loading profile failed", error);
  }

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/${project}/profiles/detail/${name}`);
    } else {
      navigate(`/ui/${project}/profiles/detail/${name}/${newTab}`);
    }
  };

  const isDefaultProfile = profile?.name === "default";

  return (
    <main className="l-main">
      <div className="p-panel profile-detail-page">
        <div className="p-panel__header">
          {isRename && profile ? (
            <ProfileRename
              profile={profile}
              project={project}
              closeForm={() => setRename(false)}
            />
          ) : (
            <Tooltip
              message={isDefaultProfile && "Cannot rename the default profile"}
              position="btm-left"
            >
              <h1
                className="p-panel__title profile-name"
                onClick={() => !isDefaultProfile && setRename(true)}
              >
                {name}
              </h1>
            </Tooltip>
          )}
          <div className="p-panel__controls">
            {<span id="control-target" ref={(ref) => setControlTarget(ref)} />}
          </div>
        </div>
        <div className="p-panel__content">
          <NotificationRow />
          {isLoading && <Loader text="Loading profile details..." />}
          {!isLoading && !profile && <>Loading profile failed</>}
          {!isLoading && profile && (
            <Row>
              <Tabs
                links={TABS.map((tab) => ({
                  label: tab,
                  id: tabNameToUrl(tab),
                  active:
                    tabNameToUrl(tab) === activeTab ||
                    (tab === "Overview" && !activeTab),
                  onClick: () => handleTabChange(tabNameToUrl(tab)),
                }))}
              />

              {!activeTab && (
                <div role="tabpanel" aria-labelledby="overview">
                  <ProfileDetailOverview
                    profile={profile}
                    controlTarget={controlTarget}
                  />
                </div>
              )}

              {activeTab === "configuration" && (
                <div role="tabpanel" aria-labelledby="configuration">
                  <EditProfileForm profile={profile} />
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
