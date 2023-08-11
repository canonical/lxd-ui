import React, { FC, useState } from "react";
import { deleteInstanceBulk } from "api/instances";
import { LxdInstance } from "types/instance";
import { pluralizeInstance } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { deletableStatuses } from "util/instanceDelete";
import { getPromiseSettledCounts } from "util/helpers";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";

interface Props {
  instances: LxdInstance[];
  onStart: (names: string[]) => void;
  onFinish: () => void;
}

const InstanceBulkDelete: FC<Props> = ({ instances, onStart, onFinish }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const deletableInstances = instances.filter((instance) =>
    deletableStatuses.includes(instance.status)
  );
  const totalCount = instances.length;
  const deleteCount = deletableInstances.length;
  const ignoredCount = totalCount - deleteCount;

  const handleDelete = () => {
    setLoading(true);
    onStart(deletableInstances.map((item) => item.name));
    void deleteInstanceBulk(deletableInstances).then((results) => {
      const { fulfilledCount, rejectedCount } =
        getPromiseSettledCounts(results);
      if (fulfilledCount === deleteCount) {
        notify.success(
          `${deleteCount} ${pluralizeInstance(deleteCount)} deleted`
        );
      } else if (rejectedCount === deleteCount) {
        notify.failure(
          "Instance bulk deletion failed",
          undefined,
          <>
            <b>{deleteCount}</b> {pluralizeInstance(deleteCount)} could not be
            deleted.
          </>
        );
      } else {
        notify.failure(
          "Instance bulk deletion partially failed",
          undefined,
          <>
            <b>{fulfilledCount}</b> {pluralizeInstance(fulfilledCount)} deleted.
            <br />
            <b>{rejectedCount}</b> {pluralizeInstance(rejectedCount)} could not
            be deleted.
          </>
        );
      }
      void queryClient.invalidateQueries({
        queryKey: [queryKeys.instances],
      });
      setLoading(false);
      onFinish();
    });
  };

  return (
    <div className="p-segmented-control bulk-actions">
      <div className="p-segmented-control__list bulk-action-frame">
        <ConfirmationButton
          onHoverText="Delete instances"
          appearance="base"
          className="u-no-margin--bottom has-icon"
          loading={isLoading}
          confirmationModalProps={{
            title: "Confirm delete",
            children: (
              <>
                {ignoredCount > 0 && (
                  <>
                    <b>{totalCount}</b> instances selected:
                    <br />
                    <br />
                    {`- ${deleteCount} stopped ${pluralizeInstance(
                      deleteCount
                    )} will be deleted`}
                    <br />
                    {`- ${ignoredCount} other ${pluralizeInstance(
                      ignoredCount
                    )} will be ignored`}
                    <br />
                    <br />
                  </>
                )}
                This will permanently delete <b>{deleteCount}</b>{" "}
                {pluralizeInstance(deleteCount)}.{"\n"}This action cannot be
                undone, and can result in data loss.
              </>
            ),
            confirmButtonLabel: "Delete",
            onConfirm: handleDelete,
          }}
          disabled={deleteCount === 0}
          shiftClickEnabled
          showShiftClickHint
        >
          <Icon name="delete" />
          <span>Delete</span>
        </ConfirmationButton>
      </div>
    </div>
  );
};

export default InstanceBulkDelete;
