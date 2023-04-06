import React, { FC, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import DeleteProfileBtn from "./actions/DeleteProfileBtn";

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

  const canRename = profile?.name !== "default";

  return (
    <main className="l-main">
      <div className="p-panel profile-detail-page">
        <div className="p-panel__header">
          <h1 className="u-off-screen">{name}</h1>
          {profile ? (
            <div className="p-panel__title">
              <nav
                key="breadcrumbs"
                className="p-breadcrumbs"
                aria-label="Breadcrumbs"
              >
                <ol className="p-breadcrumbs__items">
                  <li className="p-breadcrumbs__item">
                    <Link to={`/ui/${project}/profiles`}>Profiles</Link>
                  </li>
                  {isRename ? (
                    <li className="p-breadcrumbs__item profile-rename">
                      <ProfileRename
                        profile={profile}
                        project={project}
                        closeForm={() => setRename(false)}
                      />
                    </li>
                  ) : (
                    <li
                      className="p-breadcrumbs__item profile-name u-truncate"
                      onClick={() => canRename && setRename(true)}
                      title={name}
                    >
                      <Tooltip
                        message={
                          !canRename && "Cannot rename the default profile"
                        }
                        position="btm-left"
                      >
                        {name}
                      </Tooltip>
                    </li>
                  )}
                </ol>
              </nav>
            </div>
          ) : (
            <h4 className="p-panel__title">{name}</h4>
          )}
          <div className="p-panel__controls">
            {profile && !isRename && (
              <DeleteProfileBtn profile={profile} project={project} />
            )}
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
                  <ProfileDetailOverview profile={profile} />
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
