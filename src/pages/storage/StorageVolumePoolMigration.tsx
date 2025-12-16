import { useState, type FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import StoragePoolSelectTable from "./StoragePoolSelectTable";

interface Props {
  volume: LxdStorageVolume;
  onSelect: (pool: string) => void;
  onCancel: () => void;
  migrate: (pool: string) => void;
}

const StorageVolumePoolMigration: FC<Props> = ({
  volume,
  onSelect,
  onCancel,
  migrate,
}) => {
  const [selectedPool, setSelectedPool] = useState("");
  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate volume <strong>{volume.name}</strong> to storage pool{" "}
        <b>{selectedPool}</b>.
      </p>
    </div>
  );

  return (
    <>
      {selectedPool ? (
        summary
      ) : (
        <StoragePoolSelectTable
          onSelect={(selectedPool) => {
            setSelectedPool(selectedPool);
            onSelect(selectedPool);
          }}
          disablePool={{
            name: volume.pool,
            reason: "Volume is already in this pool",
          }}
        />
      )}

      <footer id="migrate-volume-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel migrate"
          appearance="base"
          onClick={() => {
            onCancel();
            setSelectedPool("");
          }}
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
      </footer>
    </>
  );
};

export default StorageVolumePoolMigration;
