import { FC, useState } from "react";
import {
  Button,
  Col,
  MainTable,
  Notification,
  Row,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { fetchProfiles } from "api/profiles";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProfileInstances } from "util/usedBy";
import usePanelParams from "util/usePanelParams";
import { defaultFirst } from "util/helpers";
import ProfileLink from "./ProfileLink";
import { isProjectWithProfiles } from "util/projects";
import { useProject } from "context/project";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";

const ProfileList: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project: projectName } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");

  if (!projectName) {
    return <>Missing project</>;
  }
  const isDefaultProject = projectName === "default";

  const { project, isLoading: isProjectLoading } = useProject();

  const {
    data: profiles = [],
    error,
    isLoading: isProfilesLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, projectName],
    queryFn: () => fetchProfiles(projectName),
  });

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
    const openSummary = () =>
      panelParams.openProfileSummary(profile.name, projectName);

    const usedBy =
      instanceCountMap.find((item) => profile.name === item.name)?.count ?? 0;
    const total =
      instanceCountMap.find((item) => profile.name === item.name)?.total ?? 0;

    return {
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
              className="profile-description"
              title={`Description ${profile.description}`}
            >
              {profile.description}
            </div>
          ),
          role: "rowheader",
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
          role: "rowheader",
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

  return (
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
          </PageHeader.Left>
          {featuresProfiles && (
            <PageHeader.BaseActions>
              <Button
                appearance="positive"
                className="u-no-margin--bottom u-float-right"
                onClick={() =>
                  navigate(`/ui/project/${projectName}/profiles/create`)
                }
              >
                Create profile
              </Button>
            </PageHeader.BaseActions>
          )}
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row className="no-grid-gap">
        <Col size={12}>
          {!isLoading && !featuresProfiles && (
            <Notification severity="caution" title="Profiles disabled">
              The feature has been disabled on a project level. All the
              available profiles are inherited from the{" "}
              <Link to="/ui/project/default/profiles">default project</Link>.
            </Notification>
          )}
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
                emptyStateMsg={
                  isLoading ? (
                    <Loader text="Loading profiles..." />
                  ) : (
                    <>No profile found matching this search</>
                  )
                }
                onUpdateSort={updateSort}
              />
            </TablePagination>
          </ScrollableTable>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default ProfileList;
