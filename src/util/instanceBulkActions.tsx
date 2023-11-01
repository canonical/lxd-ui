import {
  LxdInstance,
  LxdInstanceAction,
  LxdInstanceStatus,
} from "types/instance";
import { InstanceBulkAction } from "api/instances";

// map desired actions to pairs of instance status and performed action
// statuses missing will be ignored
const actionsToPerform: Partial<
  Record<
    LxdInstanceAction,
    Partial<Record<LxdInstanceStatus, LxdInstanceAction>>
  >
> = {
  start: {
    Frozen: "unfreeze",
    Stopped: "start",
  },
  restart: {
    Freezing: "restart",
    Running: "restart",
  },
  freeze: {
    Running: "freeze",
  },
  stop: {
    Freezing: "stop",
    Running: "stop",
    Starting: "stop",
    Frozen: "stop",
  },
};

export const instanceAction = (
  desiredAction: LxdInstanceAction,
  currentState: LxdInstanceStatus,
): LxdInstanceAction | undefined => {
  const actionMap = actionsToPerform[desiredAction];
  return actionMap ? actionMap[currentState] : undefined;
};

export const instanceActions = (
  instances: LxdInstance[],
  desiredAction: LxdInstanceAction,
): InstanceBulkAction[] => {
  const actions: InstanceBulkAction[] = [];
  instances.forEach((instance) => {
    const action = instanceAction(desiredAction, instance.status);
    if (action) {
      actions.push({
        name: instance.name,
        project: instance.project,
        action: action,
      });
    }
  });
  return actions;
};

export const instanceActionLabel = (action: LxdInstanceAction): string => {
  return {
    unfreeze: "started",
    start: "started",
    restart: "restarted",
    freeze: "frozen",
    stop: "stopped",
  }[action];
};

export const pluralizeInstance = (count: number) => {
  return count === 1 ? "instance" : "instances";
};

export const pluralizeSnapshot = (count: number) => {
  return count === 1 ? "snapshot" : "snapshots";
};

export const statusLabel = (status: LxdInstanceStatus) => {
  const statusToLabel: Partial<Record<LxdInstanceStatus, string>> = {
    Frozen: "frozen",
    Stopped: "stopped",
    Running: "running",
  };
  return statusToLabel[status];
};
