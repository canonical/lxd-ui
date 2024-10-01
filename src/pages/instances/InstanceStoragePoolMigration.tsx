import { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { LxdDiskDevice } from "types/device";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";
import StoragePoolSelectTable from "../storage/StoragePoolSelectTable";

interface Props {
  instance: LxdInstance;
  onSelect: (pool: string) => void;
  targetPool: string;
  onCancel: () => void;
  migrate: (pool: string) => void;
  isClustered: boolean;
}

const InstanceStoragePoolMigration: FC<Props> = ({
  instance,
  onSelect,
  targetPool,
  onCancel,
  migrate,
  isClustered,
}) => {
  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate the instance <strong>{instance.name}</strong> root
        storage to pool <b>{targetPool}</b>.
      </p>
    </div>
  );

  const rootDiskDevice = Object.values(instance.expanded_devices ?? {}).find(
    (device) => isRootDisk(device as FormDevice),
  ) as LxdDiskDevice;

  return (
    <>
      {targetPool && summary}
      {!targetPool && (
        <StoragePoolSelectTable
          project={instance.project}
          onSelect={onSelect}
          disablePool={{
            name: rootDiskDevice?.pool ?? "",
            reason: "Instance root storage already in this pool",
          }}
        />
      )}
      {(isClustered || targetPool) && (
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
            onClick={() => migrate(targetPool)}
            disabled={!targetPool}
          >
            Migrate
          </ActionButton>
        </footer>
      )}
    </>
  );
};

export default InstanceStoragePoolMigration;
