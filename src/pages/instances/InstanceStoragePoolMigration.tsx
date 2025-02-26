import type { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import StoragePoolSelectTable from "../storage/StoragePoolSelectTable";
import { getRootPool } from "util/helpers";

interface Props {
  instance: LxdInstance;
  onSelect: (pool: string) => void;
  targetPool: string;
  onCancel: () => void;
  migrate: (pool: string) => void;
}

const InstanceStoragePoolMigration: FC<Props> = ({
  instance,
  onSelect,
  targetPool,
  onCancel,
  migrate,
}) => {
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
        <StoragePoolSelectTable
          onSelect={onSelect}
          disablePool={{
            name: getRootPool(instance),
            reason: "Instance root storage already in this pool",
          }}
        />
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
          onClick={() => {
            migrate(targetPool);
          }}
          disabled={!targetPool}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceStoragePoolMigration;
