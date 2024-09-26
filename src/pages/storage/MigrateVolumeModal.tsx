import { FC, KeyboardEvent, useState } from "react";
import {
  ActionButton,
  Button,
  MainTable,
  Modal,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ScrollableTable from "components/ScrollableTable";
import { LxdStorageVolume } from "types/storage";
import { fetchStoragePools } from "api/storage-pools";
import StoragePoolSize from "./StoragePoolSize";

interface Props {
  close: () => void;
  migrate: (target: string) => void;
  storageVolume: LxdStorageVolume;
}

const MigrateVolumeModal: FC<Props> = ({ close, migrate, storageVolume }) => {
  const { data: pools = [] } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(storageVolume.project),
  });

  const [selectedPool, setSelectedPool] = useState("");

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleCancel = () => {
    if (selectedPool) {
      setSelectedPool("");
      return;
    }

    close();
  };

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver" },
    { content: "Status", sortKey: "status" },
    { content: "Size", sortKey: "size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = pools.map((pool) => {
    const disableReason =
      pool.name === storageVolume.pool
        ? "Volume is located on this cluster member"
        : "";

    const selectPool = () => {
      if (disableReason) {
        return;
      }

      setSelectedPool(pool.name);
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
          content: pool.status,
          role: "cell",
          "aria-label": "Status",
          onClick: selectPool,
        },
        {
          content: <StoragePoolSize pool={pool} />,
          role: "cell",
          "aria-label": "Size",
          onClick: selectPool,
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
          className: "u-align--right",
          onClick: selectPool,
        },
      ],
      sortData: {
        name: pool.name.toLowerCase(),
        driver: pool.driver.toLowerCase(),
        status: pool.status?.toLowerCase(),
        size: pool.config.size?.toLowerCase(),
      },
    };
  });

  const modalTitle = selectedPool
    ? "Confirm migration"
    : `Choose storage pool for volume ${storageVolume.name}`;

  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate volume <strong>{storageVolume.name}</strong> to
        storage pool <b>{selectedPool}</b>.
      </p>
    </div>
  );

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      title={modalTitle}
      buttonRow={
        <div id="migrate-instance-actions">
          <Button
            className="u-no-margin--bottom"
            type="button"
            aria-label="cancel migrate"
            appearance="base"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => migrate(selectedPool)}
            disabled={!selectedPool}
          >
            Migrate
          </ActionButton>
        </div>
      }
      onKeyDown={handleEscKey}
    >
      {selectedPool ? (
        summary
      ) : (
        <div className="migrate-instance-table u-selectable-table-rows">
          <ScrollableTable
            dependencies={[]}
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
    </Modal>
  );
};

export default MigrateVolumeModal;
