import { FC, useState } from "react";
import { updateInstanceBulkAction } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationForce from "components/ConfirmationForce";
import { LxdInstance, LxdInstanceAction } from "types/instance";
import {
  instanceActionLabel,
  instanceActions,
  pluralize,
} from "util/instanceBulkActions";
import InstanceBulkAction from "pages/instances/actions/InstanceBulkAction";
import { getPromiseSettledCounts } from "util/helpers";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";

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

  const handleAction = (desiredAction: LxdInstanceAction) => {
    setActiveAction(desiredAction);
    onStart();
    const actions = instanceActions(instances, desiredAction);

    void updateInstanceBulkAction(actions, isForce, eventQueue).then(
      (results) => {
        const action = instanceActionLabel(desiredAction);
        const count = actions.length;
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === count) {
          toastNotify.success(
            <>
              <b>{count}</b> {pluralize("instance", count)} {action}.
            </>,
          );
        } else if (rejectedCount === count) {
          toastNotify.failure(
            `Instance ${desiredAction} failed`,
            undefined,
            <>
              <b>{count}</b> {pluralize("instance", count)} could not be{" "}
              {action}.
            </>,
          );
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
          );
        }
        setForce(false);
        onFinish();
        setActiveAction(null);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      },
    );
  };

  return (
    <div className="p-segmented-control bulk-actions">
      <div className="p-segmented-control__list bulk-action-frame">
        <InstanceBulkAction
          icon="play"
          isLoading={activeAction === "start"}
          isDisabled={activeAction === "start"}
          onClick={() => handleAction("start")}
          confirmAppearance="positive"
          action="start"
          instances={instances}
          confirmLabel="Start"
        />
        <InstanceBulkAction
          icon="restart"
          isLoading={activeAction === "restart"}
          isDisabled={activeAction === "restart"}
          onClick={() => handleAction("restart")}
          action="restart"
          instances={instances}
          confirmLabel="Restart"
          confirmExtra={
            <ConfirmationForce
              label="Force restart"
              force={[isForce, setForce]}
            />
          }
        />
        <InstanceBulkAction
          icon="pause"
          isLoading={activeAction === "freeze"}
          isDisabled={activeAction === "freeze"}
          onClick={() => handleAction("freeze")}
          action="freeze"
          instances={instances}
          confirmLabel="Freeze"
        />
        <InstanceBulkAction
          icon="stop"
          isLoading={activeAction === "stop"}
          isDisabled={false}
          onClick={() => handleAction("stop")}
          action="stop"
          instances={instances}
          confirmLabel="Stop"
          confirmExtra={
            <ConfirmationForce label="Force stop" force={[isForce, setForce]} />
          }
        />
      </div>
    </div>
  );
};

export default InstanceBulkActions;
