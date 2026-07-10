import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import {
  Col,
  CustomLayout,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  SearchBox,
  Spinner,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import PageHeader from "components/PageHeader";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjects } from "context/useProjects";
import { useServerEntitlements } from "util/entitlements/server";
import { defaultFirst } from "util/helpers";
import { getInstancesUsedByProject } from "util/projects";
import { ROOT_PATH } from "util/rootPath";
import useSortTableData from "util/useSortTableData";

const ProjectList: FC = () => {
  const notify = useNotify();
  const [query, setQuery] = useState<string>("");
  const isSmallScreen = useIsScreenBelow();
  const { canCreateProjects } = useServerEntitlements();
  const { data: projects = [], error, isLoading } = useProjects();

  if (error) {
    notify.failure("Loading projects failed", error);
  }

  const filteredProjects = [...projects]
    .sort(defaultFirst)
    .filter((project) => {
      if (!query) {
        return true;
      }
      const q = query.toLowerCase();
      return (
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q)
      );
    });

  const headers = [
    { content: "Name", sortKey: "name" },
    {
      content: "Description",
      sortKey: "description",
      className: "u-hide--small",
    },
    { content: "CPU limit", sortKey: "cpuLimit", className: "u-hide--small" },
    {
      content: "Memory limit",
      sortKey: "memoryLimit",
      className: "u-hide--small",
    },
    { content: "Disk limit", sortKey: "diskLimit", className: "u-hide--small" },
    { content: "Instances", sortKey: "instances" },
  ];

  const rows = filteredProjects.map((project) => {
    const instanceCount = getInstancesUsedByProject(project).length;
    const projectInstancesPath = `${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/instances`;
    const projectConfigPath = `${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/configuration`;
    const cpuLimit = project.config["limits.cpu"] || "-";
    const memoryLimit = project.config["limits.memory"] || "-";
    const diskLimit = project.config["limits.disk"] || "-";

    return {
      key: project.name,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              to={projectConfigPath}
              className="u-truncate"
              title={project.name}
            >
              {project.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: (
            <div className="table-description" title={project.description}>
              {project.description || "-"}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
          className: "u-hide--small",
        },
        {
          content: cpuLimit,
          role: "cell",
          "aria-label": "CPU limit",
          className: "u-hide--small",
        },
        {
          content: memoryLimit,
          role: "cell",
          "aria-label": "Memory limit",
          className: "u-hide--small",
        },
        {
          content: diskLimit,
          role: "cell",
          "aria-label": "Disk limit",
          className: "u-hide--small",
        },
        {
          content: (
            <Link
              to={projectInstancesPath}
              className="u-truncate"
              title={project.name}
            >
              {instanceCount}
            </Link>
          ),
          role: "cell",
          "aria-label": "Instances",
        },
      ],
      sortData: {
        name: project.name.toLowerCase(),
        description: project.description.toLowerCase(),
        instances: instanceCount,
        cpuLimit,
        memoryLimit,
        diskLimit,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink docPath="/projects/" title="Learn more about projects">
                Projects
              </HelpLink>
            </PageHeader.Title>
            <PageHeader.Search>
              <SearchBox
                className="search-box margin-right--large u-no-margin--bottom"
                id="search-project"
                name="search-project"
                type="text"
                onChange={(value: string) => {
                  setQuery(value);
                }}
                placeholder="Search"
                value={query}
                aria-label="Search"
              />
            </PageHeader.Search>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <Link
              className={classnames("p-button--positive u-no-margin--bottom", {
                "is-disabled": !canCreateProjects(),
                "has-icon": !isSmallScreen,
              })}
              to={`${ROOT_PATH}/ui/projects/create`}
              title={
                canCreateProjects()
                  ? ""
                  : "You do not have permission to create projects"
              }
              key="create-project"
            >
              <Icon name="plus" light className="u-hide--small" />
              <span>Create project</span>
            </Link>
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        <Col size={12}>
          <ScrollableTable
            dependencies={[filteredProjects, notify.notification]}
            tableId="project-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              id="pagination"
              data={sortedRows}
              itemName="project"
              className="u-no-margin--top"
              aria-label="Table pagination control"
            >
              <MainTable
                id="project-table"
                className="project-table"
                headers={headers}
                sortable
                emptyStateMsg="No project found matching this search"
                onUpdateSort={updateSort}
              />
            </TablePagination>
          </ScrollableTable>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default ProjectList;
