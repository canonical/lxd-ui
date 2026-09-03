import type { FC } from "react";
import { Link } from "react-router-dom";
import type {
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { MainTable, TablePagination } from "@canonical/react-components";
import ProjectDefaultNetwork from "pages/projects/ProjectDefaultNetwork";
import ProjectDefaultStorage from "pages/projects/ProjectDefaultStorage";
import { ITEMS_PER_PAGE } from "pages/overview/overviewConstants";
import type { LxdProject } from "types/project";
import { defaultFirst } from "util/helpers";
import { getInstancesUsedByProject, getHomeUrl } from "util/projects";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  projects: LxdProject[];
  isAllProjects?: boolean;
}

const ProjectTable: FC<Props> = ({ projects, isAllProjects = false }) => {
  const headers: MainTableHeader[] = [
    { content: "Name" },
    { content: "Description" },
    {
      content: "Instances",
      className: "instances u-align--right",
    },
    {
      content: "Default root storage",
      className: "pre-wrap",
    },
    {
      content: "Default network",
      className: "pre-wrap",
    },
  ];

  const instanceCounts = new Map<string, number>(
    projects.map((project) => [
      project.name,
      getInstancesUsedByProject(project).length,
    ]),
  );

  const sortedProjects = isAllProjects
    ? [...projects].sort((a, b) => {
        const instanceCountDiff =
          (instanceCounts.get(b.name) ?? 0) - (instanceCounts.get(a.name) ?? 0);

        if (instanceCountDiff !== 0) {
          return instanceCountDiff;
        }

        return defaultFirst(a, b) || a.name.localeCompare(b.name);
      })
    : projects;

  const rows: MainTableRow[] = sortedProjects.map((project) => {
    const instanceCount = instanceCounts.get(project.name) ?? 0;

    return {
      key: project.name,
      className: "u-row",
      columns: [
        {
          content: isAllProjects ? (
            <Link
              to={getHomeUrl(project.name, true)}
              className="u-truncate"
              title={project.name}
            >
              {project.name}
            </Link>
          ) : (
            <span className="u-truncate" title={project.name}>
              {project.name}
            </span>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: (
            <span className="description" title={project.description}>
              {project.description || "-"}
            </span>
          ),
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: (
            <Link
              to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/instances`}
              className="u-truncate"
              title={project.name}
            >
              {instanceCount}
            </Link>
          ),
          role: "cell",
          "aria-label": "Instances",
          className: "u-align--right",
        },
        {
          content: <ProjectDefaultStorage project={project.name} />,
          role: "cell",
          "aria-label": "Default root storage",
        },
        {
          content: <ProjectDefaultNetwork project={project.name} />,
          role: "cell",
          "aria-label": "Default network",
        },
      ],
    };
  });

  const table = (
    <MainTable
      id="projects-table"
      headers={headers}
      rows={
        !isAllProjects || projects.length <= ITEMS_PER_PAGE ? rows : undefined
      }
      className="overview-table"
      emptyStateMsg="No projects found"
      responsive
    />
  );

  return isAllProjects && projects.length > ITEMS_PER_PAGE ? (
    <TablePagination
      id="projects-pagination"
      data={rows}
      pageLimits={[ITEMS_PER_PAGE]}
      itemName="project"
      position="below"
      className="u-no-margin--bottom"
      aria-label="Projects pagination control"
    >
      {table}
    </TablePagination>
  ) : (
    table
  );
};

export default ProjectTable;
