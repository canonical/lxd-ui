import { FC } from "react";
import { ActionButton, Button, MainTable } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchClusterMembers } from "api/cluster";
import ScrollableTable from "components/ScrollableTable";
import { useToastNotification } from "context/toastNotificationProvider";
import ItemName from "components/ItemName";
import { useInstanceLoading } from "context/instanceLoading";
import { migrateInstance } from "api/instances";
import { useEventQueue } from "context/eventQueue";

interface Props {
  close: () => void;
  instance: LxdInstance;
  onSelect: (member: string) => void;
  targetMember: string;
  onCancel: () => void;
}

const ClusterMemberMigrationTable: FC<Props> = ({
  close,
  instance,
  onSelect,
  targetMember,
  onCancel,
}) => {
  const toastNotify = useToastNotification();
  const instanceLoading = useInstanceLoading();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const { data: members = [] } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
  });

  const handleSuccess = (newTarget: string, instanceName: string) => {
    toastNotify.success(
      <>
        Instance <ItemName item={{ name: instanceName }} bold /> successfully
        migrated to cluster member <ItemName item={{ name: newTarget }} bold />
      </>,
    );
  };

  const notifyFailure = (e: unknown, instanceName: string) => {
    instanceLoading.setFinish(instance);
    toastNotify.failure(
      `Cluster member migration failed for instance ${instanceName}`,
      e,
    );
  };

  const handleFailure = (msg: string, instanceName: string) => {
    notifyFailure(new Error(msg), instanceName);
  };

  const handleFinish = () => {
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance.name],
    });
    instanceLoading.setFinish(instance);
  };

  const handleMigrate = () => {
    instanceLoading.setLoading(instance, "Migrating");
    migrateInstance(instance.name, instance.project, targetMember)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => handleSuccess(targetMember, instance.name),
          (err) => handleFailure(err, instance.name),
          handleFinish,
        );
        toastNotify.info(
          `Cluster member migration started for instance ${instance.name}`,
        );
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances, instance.name, instance.project],
        });
      })
      .catch((e) => {
        notifyFailure(e, instance.name);
      })
      .finally(() => {
        close();
      });
  };

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Roles", sortKey: "roles" },
    { content: "Architecture", sortKey: "architecture" },
    { content: "Status", sortKey: "status" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = members.map((member) => {
    const disableReason =
      member.server_name === instance.location
        ? "Instance already running on this member"
        : "";

    const selectMember = () => {
      if (disableReason) {
        return;
      }
      onSelect(member.server_name);
    };

    return {
      className: "u-row",
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
          role: "cell",
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
        archietecture: member.architecture.toLowerCase(),
        status: member.status.toLowerCase(),
      },
    };
  });

  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate instance <strong>{instance.name}</strong> to cluster
        member <b>{targetMember}</b>.
      </p>
    </div>
  );

  return (
    <>
      {targetMember && summary}
      {!targetMember && (
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
            />
          </ScrollableTable>
        </div>
      )}
      <footer id="migrate-instance-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel migrate"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={handleMigrate}
          disabled={!targetMember}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default ClusterMemberMigrationTable;
