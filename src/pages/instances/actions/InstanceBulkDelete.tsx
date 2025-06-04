import type { FC } from "react";
import { Fragment, useState } from "react";
import { deleteInstanceBulk } from "api/instances";
import type { LxdInstance } from "types/instance";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { deletableStatuses } from "util/instanceDelete";
import { getPromiseSettledCounts } from "util/promises";
import { useEventQueue } from "context/eventQueue";
import { useInstanceEntitlements } from "util/entitlements/instances";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useToastNotification } from "@canonical/react-components";

interface Props {
  instances: LxdInstance[];
  onStart: (names: string[]) => void;
  onFinish: () => void;
}

const InstanceBulkDelete: FC<Props> = ({ instances, onStart, onFinish }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canDeleteInstance } = useInstanceEntitlements();
  const restrictedInstances = instances.filter(
    (instance) => !canDeleteInstance(instance),
  );
  const deletableInstances = instances.filter(
    (instance) =>
      deletableStatuses.includes(instance.status) &&
      canDeleteInstance(instance),
  );
  const totalCount = instances.length;
  const deleteCount = deletableInstances.length;
  const restrictedCount = restrictedInstances.length;
  const ignoredCount = totalCount - deleteCount - restrictedCount;

  const handleDelete = () => {
    setLoading(true);
    onStart(deletableInstances.map((item) => item.name));
    deleteInstanceBulk(deletableInstances, eventQueue)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === deleteCount) {
          toastNotify.success(
            `${deleteCount} ${pluralize("instance", deleteCount)} deleted`,
          );
        } else if (rejectedCount === deleteCount) {
          toastNotify.failure(
            "Instance bulk deletion failed",
            undefined,
            <>
              <b>{deleteCount}</b> {pluralize("instance", deleteCount)} could
              not be deleted.
            </>,
          );
        } else {
          toastNotify.failure(
            "Instance bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("instance", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("instance", rejectedCount)}{" "}
              could not be deleted.
            </>,
          );
        }
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, instances[0].project],
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        toastNotify.failure("Instance bulk deletion failed", e);
        setLoading(false);
      });
  };

  const getBulkDeleteBreakdown = () => {
    if (ignoredCount + restrictedCount === 0) {
      return undefined;
    }

    const breakdown: string[] = [];
    if (deleteCount) {
      breakdown.push(
        `${deleteCount} stopped ${pluralize("instance", deleteCount)} will be deleted`,
      );
    }

    if (restrictedCount) {
      breakdown.push(
        `${restrictedCount} ${pluralize("instance", restrictedCount)} that you do not have permission to delete will be ignored`,
      );
    }

    if (ignoredCount) {
      breakdown.push(
        `${ignoredCount} other ${pluralize("instance", ignoredCount)} will be ignored`,
      );
    }

    return breakdown;
  };

  return (
    <div className="p-segmented-control bulk-actions">
      <div className="p-segmented-control__list bulk-action-frame">
        <BulkDeleteButton
          entities={instances}
          deletableEntities={deletableInstances}
          entityType="instance"
          onDelete={handleDelete}
          disabledReason={
            restrictedCount === totalCount
              ? `You do not have permission to delete the selected ${pluralize("instance", instances.length)}`
              : undefined
          }
          confirmationButtonProps={{
            loading: isLoading,
            appearance: "base",
          }}
          bulkDeleteBreakdown={getBulkDeleteBreakdown()}
          className="u-no-margin--bottom"
        />
      </div>
    </div>
  );
};

export default InstanceBulkDelete;
