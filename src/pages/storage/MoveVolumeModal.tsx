import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { ActionButton, Button, Modal } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import StoragePoolSelectTable from "./StoragePoolSelectTable";

interface Props {
  close: () => void;
  move: (target: string) => void;
  storageVolume: LxdStorageVolume;
}

const MoveVolumeModal: FC<Props> = ({ close, move, storageVolume }) => {
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
    ? "Confirm move"
    : `Choose storage pool for volume ${storageVolume.name}`;

  const summary = (
    <div className="move-instance-summary">
      <p>
        This will move volume <strong>{storageVolume.name}</strong> to storage
        pool <b>{selectedPool}</b>.
      </p>
    </div>
  );

  return (
    <Modal
      close={close}
      className="move-instance-modal"
      title={modalTitle}
      buttonRow={
        <div id="move-instance-actions">
          <Button
            className="u-no-margin--bottom"
            type="button"
            aria-label="cancel move"
            appearance="base"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => {
              move(selectedPool);
            }}
            disabled={!selectedPool}
          >
            Move
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

export default MoveVolumeModal;
