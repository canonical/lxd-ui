import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { ActionButton, Button, Modal } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import StoragePoolSelectTable from "./StoragePoolSelectTable";

interface Props {
  close: () => void;
  migrate: (target: string) => void;
  storageVolume: LxdStorageVolume;
}

const MigrateVolumeModal: FC<Props> = ({ close, migrate, storageVolume }) => {
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
            onClick={() => {
              migrate(selectedPool);
            }}
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
        <StoragePoolSelectTable
          onSelect={setSelectedPool}
          disablePool={{
            name: storageVolume.pool,
            reason: "Volume is already in this pool",
          }}
        />
      )}
    </Modal>
  );
};

export default MigrateVolumeModal;
