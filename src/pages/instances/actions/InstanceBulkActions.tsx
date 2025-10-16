import type { FC } from "react";
import { useState } from "react";
import { updateInstanceBulkAction } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationForce from "components/ConfirmationForce";
import type { LxdInstance, LxdInstanceAction } from "types/instance";
import {
  instanceActionLabel,
  instanceActions,
  pluralize,
} from "util/instanceBulkActions";
import InstanceBulkAction from "pages/instances/actions/InstanceBulkAction";
import { getPromiseSettledCounts } from "util/promises";
import { useEventQueue } from "context/eventQueue";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { getInstanceKey } from "util/instances";
import { useToastNotification } from "@canonical/react-components";
import { useBulkDetails } from "context/useBulkDetails";

interface Props {
  instances: LxdInstance[];
  onStart: () => void;
  onFinish: () => void;
}

const InstanceBulkActions: FC<Props> = ({ instances, onStart, onFinish }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<LxdInstanceAction | null>(
    null,
  );
  const [isForce, setForce] = useState(false);
  const { canUpdateInstanceState } = useInstanceEntitlements();
  const viewBulkDetails = useBulkDetails();

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const delayedClearCache = () => {
    // Delay clearing the cache, because the instance is reported as RUNNING
    // when a start operation failed, only shortly after it goes back to STOPPED
    // and we want to avoid showing the intermediate RUNNING state.
    setTimeout(clearCache, 1500);
  };

  const handleAction = (desiredAction: LxdInstanceAction) => {
    setActiveAction(desiredAction);
    onStart();
    const validInstances = instances.filter(canUpdateInstanceState);
    const actions = instanceActions(validInstances, desiredAction);

    updateInstanceBulkAction(actions, isForce, eventQueue)
      .then((results) => {
        const action = instanceActionLabel(desiredAction);
        const count = actions.length;
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === count) {
          toastNotify.success(
            <>
              <b>{count}</b> {pluralize("instance", count)} {action}.
            </>,
            viewBulkDetails(results),
          );
          clearCache();
        } else if (rejectedCount === count) {
          toastNotify.failure(
            `Instance ${desiredAction} failed`,
            undefined,
            <>
              <b>{count}</b> {pluralize("instance", count)} could not be{" "}
              {action}.
            </>,
            viewBulkDetails(results),
          );
          delayedClearCache();
        } else {
          toastNotify.failure(
            `Instance ${desiredAction} partially failed`,
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("instance", fulfilledCount)}{" "}
              {action}
              .<br />
              <b>{rejectedCount}</b> {pluralize("instance", rejectedCount)}{" "}
              could not be {action}.
            </>,
            viewBulkDetails(results),
          );
          delayedClearCache();
        }
        setForce(false);
        onFinish();
        setActiveAction(null);
      })
      .catch((e) => {
        toastNotify.failure(`Instance ${desiredAction} failed`, e);
        delayedClearCache();
      });
  };

  const restrictedInstances = instances
    .filter((instance) => !canUpdateInstanceState(instance))
    .map(getInstanceKey);

  return (
    <div className="p-segmented-control bulk-actions">
      <div className="p-segmented-control__list bulk-action-frame">
        <InstanceBulkAction
          icon="play"
          isLoading={activeAction === "start"}
          isDisabled={activeAction === "start"}
          onClick={() => {
            handleAction("start");
          }}
          confirmAppearance="positive"
          action="start"
          instances={instances}
          confirmLabel="Start"
          restrictedInstances={restrictedInstances}
        />
        <InstanceBulkAction
          icon="restart"
          isLoading={activeAction === "restart"}
          isDisabled={activeAction === "restart"}
          onClick={() => {
            handleAction("restart");
          }}
          action="restart"
          instances={instances}
          confirmLabel="Restart"
          confirmExtra={
            <ConfirmationForce
              label="Force restart"
              force={[isForce, setForce]}
            />
          }
          restrictedInstances={restrictedInstances}
        />
        <InstanceBulkAction
          icon="pause"
          isLoading={activeAction === "freeze"}
          isDisabled={activeAction === "freeze"}
          onClick={() => {
            handleAction("freeze");
          }}
          action="freeze"
          instances={instances}
          confirmLabel="Freeze"
          restrictedInstances={restrictedInstances}
        />
        <InstanceBulkAction
          icon="stop"
          isLoading={activeAction === "stop"}
          isDisabled={false}
          onClick={() => {
            handleAction("stop");
          }}
          action="stop"
          instances={instances}
          confirmLabel="Stop"
          confirmExtra={
            <ConfirmationForce label="Force stop" force={[isForce, setForce]} />
          }
          restrictedInstances={restrictedInstances}
        />
      </div>
    </div>
  );
};

export default InstanceBulkActions;
