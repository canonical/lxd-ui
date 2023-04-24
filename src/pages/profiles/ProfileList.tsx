import React, { FC, useEffect, useState } from "react";
import {
  MainTable,
  Row,
  Button,
  Notification,
  SearchBox,
  Col,
} from "@canonical/react-components";
import { fetchProfiles } from "api/profiles";
import classnames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";
import ItemName from "components/ItemName";
import { getProfileInstances } from "util/usedBy";
import usePanelParams from "util/usePanelParams";
import { usePagination } from "util/pagination";
import useEventListener from "@use-it/event-listener";
import { updateTBodyHeight } from "util/updateTBodyHeight";
import Pagination from "components/Pagination";
import NotificationRow from "components/NotificationRow";
import { fetchProject } from "api/projects";

const ProfileList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project: projectName } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");

  if (!projectName) {
    return <>Missing project</>;
  }
  const isDefaultProject = projectName === "default";

  const {
    data: profiles = [],
    error,
    isLoading: isProfilesLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, projectName],
    queryFn: () => fetchProfiles(projectName),
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
    notify.failure("Loading profiles failed", error);
  }

  if (projectError) {
    notify.failure("Loading project failed", error);
  }
  const isLoading = isProfilesLoading || isProjectLoading;

  const featuresProfiles = project?.config["features.profiles"] === "true";

  profiles.sort((p1, p2) =>
    p1.name === "default" ? -1 : p2.name === "default" ? 1 : 0
  );

  const instanceCountMap = profiles.map((profile) => {
    const usedByInstances = getProfileInstances(
      projectName,
      isDefaultProject,
      profile.used_by
    );
    return {
      name: profile.name,
      count: usedByInstances.filter(
        (instance) => instance.project === projectName
      ).length,
      total: usedByInstances.length,
    };
  });

  const filteredProfiles = profiles.filter((item) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    {
      content: "Used by",
      sortKey: "used_by",
    },
  ];

  const rows = filteredProfiles.map((profile) => {
    const usedBy =
      instanceCountMap.find((item) => profile.name === item.name)?.count ?? 0;
    const total =
      instanceCountMap.find((item) => profile.name === item.name)?.total ?? 0;

    return {
      columns: [
        {
          content: (
            <div className="u-truncate" title={profile.name}>
              <Link to={`/ui/${projectName}/profiles/detail/${profile.name}`}>
                <ItemName item={profile} />
              </Link>
            </div>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: (
            <div className="u-truncate" title={profile.description}>
              {profile.description}
            </div>
          ),
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: (
            <>
              {usedBy} {usedBy === 1 ? "instance" : "instances"}
              {isDefaultProject && (
                <>
                  <div className="u-text--muted">{total} in all projects</div>
                </>
              )}
            </>
          ),
          role: "rowheader",
          "aria-label": "Used by",
        },
      ],
      sortData: {
        name: profile.name.toLowerCase(),
        description: profile.description.toLowerCase(),
        used_by: usedBy,
      },
    };
  });

  const pagination = usePagination(rows);

  useEventListener("resize", () => updateTBodyHeight("profile-table-wrapper"));
  useEffect(() => {
    updateTBodyHeight("profile-table-wrapper");
  }, [
    profiles,
    notify.notification,
    query,
    pagination.pageSize,
    pagination.currentPage,
  ]);

  return (
    <main className="l-main profile-list">
      <div
        className={classnames("p-panel", {
          "has-side-panel": !!panelParams.profile,
        })}
      >
        <div className="p-panel__header profile-list-header">
          <div className="profile-header-left">
            <h1 className="p-heading--4 u-no-margin--bottom">Profiles</h1>
            <SearchBox
              className="search-box margin-right u-no-margin--bottom"
              name="search-profile"
              type="text"
              onChange={(value) => {
                setQuery(value);
              }}
              placeholder="Search"
              value={query}
              aria-label="Search"
            />
          </div>
          {featuresProfiles && (
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={() => navigate(`/ui/${projectName}/profiles/create`)}
            >
              Create profile
            </Button>
          )}
        </div>
        <div className="p-panel__content profile-content">
          <NotificationRow />
          <Row className="no-grid-gap">
            <Col size={12}>
              {!isLoading && !featuresProfiles && (
                <Notification severity="caution" title="Profiles disabled">
                  The feature has been disabled on a project level. All the
                  available profiles are inherited from the default project.
                </Notification>
              )}
              <MainTable
                headers={headers}
                rows={pagination.pageData}
                sortable
                className="profile-table"
                id="profile-table-wrapper"
                emptyStateMsg={
                  isLoading ? (
                    <Loader text="Loading profiles..." />
                  ) : (
                    <>No profile found matching this search</>
                  )
                }
                onUpdateSort={pagination.updateSort}
              />
              <Pagination
                {...pagination}
                totalCount={profiles.length}
                visibleCount={
                  filteredProfiles.length === profiles.length
                    ? pagination.pageData.length
                    : filteredProfiles.length
                }
                keyword="profile"
              />
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

export default ProfileList;
