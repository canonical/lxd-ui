import { FC } from "react";
import { ActionButton, Button, MainTable } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ScrollableTable from "components/ScrollableTable";
import { useToastNotification } from "context/toastNotificationProvider";
import ItemName from "components/ItemName";
import { useInstanceLoading } from "context/instanceLoading";
import { migrateInstance } from "api/instances";
import { useEventQueue } from "context/eventQueue";
import { fetchStoragePools } from "api/storage-pools";
import { LxdDiskDevice } from "types/device";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";

interface Props {
  close: () => void;
  instance: LxdInstance;
  onSelect: (pool: string) => void;
  targetPool: string;
  onCancel: () => void;
}

const StoragePoolMigrationTable: FC<Props> = ({
  close,
  instance,
  onSelect,
  targetPool,
  onCancel,
}) => {
  const toastNotify = useToastNotification();
  const instanceLoading = useInstanceLoading();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const { data: pools = [] } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(instance.project),
  });

  const handleSuccess = (newTarget: string, instanceName: string) => {
    toastNotify.success(
      <>
        Instance <ItemName item={{ name: instanceName }} bold /> root storage
        successfully migrated to pool{" "}
        <ItemName item={{ name: newTarget }} bold />
      </>,
    );
  };

  const notifyFailure = (e: unknown, instanceName: string) => {
    instanceLoading.setFinish(instance);
    toastNotify.failure(
      `Root storage migration failed for instance ${instanceName}`,
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
    migrateInstance(instance.name, instance.project, undefined, targetPool)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => handleSuccess(targetPool, instance.name),
          (err) => handleFailure(err, instance.name),
          handleFinish,
        );
        toastNotify.info(
          `Root storage migration started for instance ${instance.name}`,
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
    { content: "Driver", sortKey: "driver" },
    { content: "Size", className: "size" },
    { content: "Status", sortKey: "status" },
    {
      content: "Volumes",
      sortKey: "volumes",
      className: "u-align--right",
    },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rootDiskDevice = Object.values(instance.expanded_devices ?? {}).find(
    (device) => isRootDisk(device as FormDevice),
  ) as LxdDiskDevice;

  const rows = pools.map((pool) => {
    const volumes =
      pool.used_by?.filter((url) => !url.startsWith("/1.0/profiles")) ?? [];
    const totalVolumeCount = volumes.length;

    let disableReason = "";
    if (rootDiskDevice && pool.name === rootDiskDevice.pool) {
      disableReason = "Instance root storage already in this pool";
    }

    const selectPool = () => {
      if (disableReason) {
        return;
      }
      onSelect(pool.name);
    };

    return {
      className: "u-row",
      columns: [
        {
          content: (
            <div className="u-truncate migrate-instance-name" title={pool.name}>
              {pool.name}
            </div>
          ),
          role: "cell",
          "aria-label": "Name",
          onClick: selectPool,
        },
        {
          content: pool.driver,
          role: "cell",
          "aria-label": "Driver",
          onClick: selectPool,
        },
        {
          content: <StoragePoolSize pool={pool} />,
          role: "cell",
          "aria-label": "Size",
          onClick: selectPool,
          className: "size",
        },
        {
          content: pool.status,
          role: "cell",
          "aria-label": "Status",
          onClick: selectPool,
        },
        {
          content: totalVolumeCount,
          role: "cell",
          "aria-label": "Volumes in all projects",
          onClick: selectPool,
          className: "u-align--right",
        },
        {
          content: (
            <Button
              onClick={selectPool}
              dense
              title={disableReason}
              disabled={Boolean(disableReason)}
            >
              Select
            </Button>
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
          onClick: selectPool,
        },
      ],
      sortData: {
        name: pool.name.toLowerCase(),
        driver: pool.driver,
        status: pool.status,
        volumes: totalVolumeCount,
      },
    };
  });

  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate the instance <strong>{instance.name}</strong> root
        storage to pool <b>{targetPool}</b>.
      </p>
    </div>
  );

  return (
    <>
      {targetPool && summary}
      {!targetPool && (
        <div className="migrate-instance-table u-selectable-table-rows">
          <ScrollableTable
            dependencies={[pools]}
            tableId="migrate-instance-table"
            belowIds={["status-bar", "migrate-instance-actions"]}
          >
            <MainTable
              id="migrate-instance-table"
              headers={headers}
              rows={rows}
              sortable
              className="u-table-layout--auto storage-pools"
              emptyStateMsg="No storage pools available"
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
          disabled={!targetPool}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default StoragePoolMigrationTable;
