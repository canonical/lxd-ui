import { FC } from "react";
import { Button, MainTable } from "@canonical/react-components";
import ScrollableTable from "components/ScrollableTable";
import classnames from "classnames";
import { useProjects } from "context/useProjects";

interface Props {
  onSelect: (project: string) => void;
  disableProject?: {
    name: string;
    reason: string;
  };
}

const ProjectSelectTable: FC<Props> = ({ onSelect, disableProject }) => {
  const { data: projects = [] } = useProjects();

  const headers = [
    { content: "Name", sortKey: "name" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = projects.map((project) => {
    const disableReason =
      disableProject?.name === project.name ? disableProject?.reason : null;
    const selectProject = () => {
      if (disableReason) {
        return;
      }
      onSelect(project.name);
    };

    return {
      key: project.name,
      className: classnames("u-row", {
        "u-text--muted": disableReason,
        "u-row--disabled": disableReason,
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
          role: "cell",
          "aria-label": "Name",
          onClick: selectProject,
        },
        {
          content: (
            <Button
              onClick={selectProject}
              dense
              title={disableReason}
              disabled={Boolean(disableReason)}
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
