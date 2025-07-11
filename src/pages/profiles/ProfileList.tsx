import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  Col,
  EmptyState,
  Icon,
  MainTable,
  Notification,
  Row,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProfileInstances } from "util/usedBy";
import usePanelParams, { panels } from "util/usePanelParams";
import { defaultFirst } from "util/helpers";
import ProfileLink from "./ProfileLink";
import { isProjectWithProfiles } from "util/projects";
import { useCurrentProject } from "context/useCurrentProject";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import ProfileDetailPanel from "./ProfileDetailPanel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProfiles } from "context/useProfiles";

const ProfileList: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project: projectName } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const isSmallScreen = useIsScreenBelow();

  if (!projectName) {
    return <>Missing project</>;
  }
  const isDefaultProject = projectName === "default";

  const { project, isLoading: isProjectLoading } = useCurrentProject();
  const { canCreateProfiles } = useProjectEntitlements();

  const {
    data: profiles = [],
    error,
    isLoading: isProfilesLoading,
  } = useProfiles(projectName);

  if (error) {
    notify.failure("Loading profiles failed", error);
  }

  const isLoading = isProfilesLoading || isProjectLoading;

  const featuresProfiles = isProjectWithProfiles(project);

  profiles.sort(defaultFirst);

  const instanceCountMap = profiles.map((profile) => {
    const usedByInstances = getProfileInstances(
      projectName,
      isDefaultProject,
      profile.used_by,
    );
    return {
      name: profile.name,
      count: usedByInstances.filter(
        (instance) => instance.project === projectName,
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
    const openSummary = () => {
      panelParams.openProfileSummary(profile.name, projectName);
    };

    const usedBy =
      instanceCountMap.find((item) => profile.name === item.name)?.count ?? 0;
    const total =
      instanceCountMap.find((item) => profile.name === item.name)?.total ?? 0;

    return {
      key: profile.name,
      className:
        panelParams.profile === profile.name ? "u-row-selected" : "u-row",
      columns: [
        {
          content: (
            <div className="u-truncate" title={`Profile ${profile.name}`}>
              <ProfileLink
                profile={{ name: profile.name, project: projectName }}
              />
            </div>
          ),
          role: "rowheader",
          "aria-label": "Name",
          onClick: openSummary,
        },
        {
          content: (
            <div
              className="table-description"
              title={`Description ${profile.description}`}
            >
              {profile.description}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
          onClick: openSummary,
          className: "clickable-cell",
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
          role: "cell",
          "aria-label": "Used by",
          onClick: openSummary,
          className: "clickable-cell",
        },
      ],
      sortData: {
        name: profile.name.toLowerCase(),
        description: profile.description.toLowerCase(),
        used_by: usedBy,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  return (
    <>
      <CustomLayout
        mainClassName="profile-list"
        contentClassName="profile-content"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  href={`${docBaseLink}/profiles/`}
                  title="Learn how to use profiles"
                >
                  Profiles
                </HelpLink>
              </PageHeader.Title>
              {profiles.length > 0 && (
                <PageHeader.Search>
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
                </PageHeader.Search>
              )}
            </PageHeader.Left>
            {featuresProfiles && (
              <PageHeader.BaseActions>
                <Button
                  appearance="positive"
                  className="u-no-margin--bottom u-float-right"
                  onClick={async () =>
                    navigate(
                      `/ui/project/${encodeURIComponent(projectName)}/profiles/create`,
                    )
                  }
                  hasIcon={!isSmallScreen}
                  disabled={!canCreateProfiles(project)}
                  title={
                    canCreateProfiles(project)
                      ? ""
                      : "You do not have permission to create profiles in this project"
                  }
                >
                  {!isSmallScreen && <Icon name="plus" light />}
                  <span>Create profile</span>
                </Button>
                <Button
                  appearance=""
                  className="u-no-margin--bottom u-float-right"
                  onClick={async () =>
                    navigate(
                      `/ui/project/${encodeURIComponent(projectName)}/placement-groups`,
                    )
                  }
                >
                  <span>Placement groups</span>
                </Button>
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row className="no-grid-gap">
          <Col size={12}>
            {!featuresProfiles && (
              <Notification severity="caution" title="Profiles disabled">
                The feature has been disabled on a project level. All the
                available profiles are inherited from the{" "}
                <Link to="/ui/project/default/profiles">default project</Link>.
              </Notification>
            )}
            {profiles.length === 0 && (
              <EmptyState
                className="empty-state"
                image={<Icon name="repository" className="empty-state-icon" />}
                title="No profiles found"
              >
                <p>There are no profiles in this project.</p>
              </EmptyState>
            )}
            {profiles.length > 0 && (
              <ScrollableTable
                dependencies={[filteredProfiles, notify.notification]}
                tableId="profile-table"
                belowIds={["status-bar"]}
              >
                <TablePagination
                  id="pagination"
                  data={sortedRows}
                  itemName="profile"
                  className="u-no-margin--top"
                  aria-label="Table pagination control"
                >
                  <MainTable
                    id="profile-table"
                    headers={headers}
                    sortable
                    emptyStateMsg="No profile found matching this search"
                    onUpdateSort={updateSort}
                  />
                </TablePagination>
              </ScrollableTable>
            )}
          </Col>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.profileSummary && <ProfileDetailPanel />}
    </>
  );
};

export default ProfileList;
