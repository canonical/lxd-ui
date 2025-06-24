import type { FC } from "react";
import { Button, MainTable } from "@canonical/react-components";
import ScrollableTable from "components/ScrollableTable";
import classnames from "classnames";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  onSelect: (project: string) => void;
  disableProject?: {
    name: string;
    reason: string;
  };
}

const ProjectSelectTable: FC<Props> = ({ onSelect, disableProject }) => {
  const { data: projects = [] } = useProjects();
  const { canCreateInstances } = useProjectEntitlements();

  const headers = [
    { content: "Name", sortKey: "name" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = projects.map((project) => {
    const getDisableReason = () => {
      if (!canCreateInstances(project)) {
        return "You do not have permission to create instances in this project";
      }

      return disableProject?.name === project.name
        ? disableProject?.reason
        : null;
    };

    const selectProject = () => {
      if (getDisableReason()) {
        return;
      }
      onSelect(project.name);
    };

    return {
      key: project.name,
      className: classnames("u-row", {
        "u-text--muted": !!getDisableReason(),
        "u-row--disabled": !!getDisableReason(),
      }),
      columns: [
        {
          content: (
            <div
              className="u-truncate migrate-instance-name"
              title={project.name}
            >
              {project.name}
            </div>
          ),
          role: "rowheader",
          "aria-label": "Name",
          onClick: selectProject,
        },
        {
          content: (
            <Button
              onClick={selectProject}
              dense
              title={getDisableReason()}
              disabled={Boolean(getDisableReason())}
            >
              Select
            </Button>
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right",
          onClick: selectProject,
        },
      ],
      sortData: {
        name: project.name.toLowerCase(),
      },
    };
  });

  return (
    <div className="migrate-instance-table u-selectable-table-rows">
      <ScrollableTable
        dependencies={[projects]}
        tableId="migrate-instance-table"
        belowIds={["status-bar", "migrate-instance-actions"]}
      >
        <MainTable
          id="migrate-instance-table"
          headers={headers}
          rows={rows}
          sortable
          className="u-table-layout--auto"
        />
      </ScrollableTable>
    </div>
  );
};

export default ProjectSelectTable;
