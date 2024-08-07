import { FC, useState } from "react";
import { ActionButton, Icon } from "@canonical/react-components";
import usePortal from "react-useportal";
import { migrateInstanceBulk } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import { LxdInstance } from "types/instance";
import { getPromiseSettledCounts } from "util/helpers";
import { pluralize } from "util/instanceBulkActions";
import MigrateInstanceModal from "../MigrateInstanceModal";

interface Props {
  instances: LxdInstance[];
  onStart: () => void;
  onFinish: () => void;
}

const BulkMigrateInstanceBtn: FC<Props> = ({
  instances,
  onFinish,
  onStart,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleMigrate = (target: string, instances: LxdInstance[]) => {
    const migrateCount = instances.length;

    setIsLoading(true);
    onStart();

    void migrateInstanceBulk(instances, eventQueue, target).then((results) => {
      const { fulfilledCount, rejectedCount } =
        getPromiseSettledCounts(results);

      if (fulfilledCount === migrateCount) {
        toastNotify.success(
          `${migrateCount} ${pluralize("instance", migrateCount)} migrated to ${target}`,
        );
      } else if (rejectedCount === migrateCount) {
        toastNotify.failure(
          "Instance bulk migration failed",
          undefined,
          <>
            <b>{migrateCount}</b> {pluralize("instance", migrateCount)} could
            not be migrated.
          </>,
        );
      } else {
        toastNotify.failure(
          "Instance bulk migration partially failed",
          undefined,
          <>
            <b>{fulfilledCount}</b> {pluralize("instance", fulfilledCount)}{" "}
            migrated to {target}.
            <br />
            <b>{rejectedCount}</b> {pluralize("instance", rejectedCount)} could
            not be migrated.
          </>,
        );
      }

      void queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === queryKeys.instances;
        },
      });

      setIsLoading(false);
      onFinish();
    });
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <MigrateInstanceModal
            close={closePortal}
            migrate={handleMigrate}
            instances={instances}
          />
        </Portal>
      )}
      <div className="p-segmented-control bulk-actions">
        <div className="p-segmented-control__list bulk-action-frame">
          <ActionButton
            onClick={openPortal}
            type="button"
            appearance="base"
            className="instance-migrate u-no-margin--bottom has-icon"
            loading={isLoading}
          >
            <Icon name="machines" />
            <span>Migrate</span>
          </ActionButton>
        </div>
      </div>
    </>
  );
};

export default BulkMigrateInstanceBtn;
