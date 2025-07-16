import type { FC } from "react";
import { Button, MainTable } from "@canonical/react-components";
import ScrollableTable from "components/ScrollableTable";
import classnames from "classnames";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  onSelect: (member: string) => void;
  disableMember?: {
    name: string;
    reason: string;
  };
}

const ClusterMemberSelectTable: FC<Props> = ({ onSelect, disableMember }) => {
  const { data: members = [], isLoading } = useClusterMembers();

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Roles", sortKey: "roles" },
    { content: "Architecture", sortKey: "architecture" },
    { content: "Status", sortKey: "status" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = members.map((member) => {
    const disableReason =
      disableMember?.name === member.server_name ? disableMember?.reason : null;
    const selectMember = () => {
      if (disableReason) {
        return;
      }
      onSelect(member.server_name);
    };

    return {
      key: member.server_name,
      className: classnames("u-row", {
        "u-text--muted": disableReason,
        "u-row--disabled": disableReason,
      }),
      columns: [
        {
          content: (
            <div
              className="u-truncate migrate-instance-name"
              title={member.server_name}
            >
              {member.server_name}
            </div>
          ),
          role: "rowheader",
          "aria-label": "Name",
          onClick: selectMember,
        },
        {
          content: member.roles.join(", "),
          role: "cell",
          "aria-label": "Roles",
          onClick: selectMember,
        },
        {
          content: member.architecture,
          role: "cell",
          "aria-label": "Architecture",
          onClick: selectMember,
        },
        {
          content: member.status,
          role: "cell",
          "aria-label": "Status",
          onClick: selectMember,
        },
        {
          content: (
            <Button
              onClick={selectMember}
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
          onClick: selectMember,
        },
      ],
      sortData: {
        name: member.server_name.toLowerCase(),
        roles: member.roles.join(", ").toLowerCase(),
        architecture: member.architecture.toLowerCase(),
        status: member.status.toLowerCase(),
      },
    };
  });

  return (
    <div className="migrate-instance-table u-selectable-table-rows">
      <ScrollableTable
        dependencies={[members]}
        tableId="migrate-instance-table"
        belowIds={["status-bar", "migrate-instance-actions"]}
      >
        <MainTable
          id="migrate-instance-table"
          headers={headers}
          rows={rows}
          sortable
          className="u-table-layout--auto"
          emptyStateMsg={
            isLoading
              ? "Loading cluster members..."
              : "No cluster members available"
          }
        />
      </ScrollableTable>
    </div>
  );
};

export default ClusterMemberSelectTable;
