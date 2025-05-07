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
  move: (pool: string) => void;
}

const InstanceStoragePoolMove: FC<Props> = ({
  instance,
  onSelect,
  targetPool,
  onCancel,
  move,
}) => {
  const summary = (
    <div className="move-instance-summary">
      <p>
        This will move the instance <strong>{instance.name}</strong> root
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
      <footer id="move-instance-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel move"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => {
            move(targetPool);
          }}
          disabled={!targetPool}
        >
          Move
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceStoragePoolMove;
