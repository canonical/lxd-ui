import { type LxdInstanceStatus, type LxdInstance } from "types/instance";

export interface InstanceDistribution {
  runningCount: number;
  stoppedCount: number;
  frozenCount: number;
  errorCount: number;
  containerCount: number;
  virtualMachineCount: number;
}

const FROZEN_INSTANCE_STATUSES = new Set<LxdInstanceStatus>([
  "Freezing",
  "Frozen",
]);

const INITIAL_INSTANCE_DISTRIBUTION: InstanceDistribution = {
  runningCount: 0,
  stoppedCount: 0,
  frozenCount: 0,
  errorCount: 0,
  containerCount: 0,
  virtualMachineCount: 0,
};

export const getInstanceDistribution = (
  instances: LxdInstance[],
): InstanceDistribution => {
  return instances.reduce<InstanceDistribution>(
    (accumulator, instance) => {
      const { status, type } = instance;

      if (status === "Running") {
        accumulator.runningCount += 1;
      } else if (status === "Stopped") {
        accumulator.stoppedCount += 1;
      } else if (FROZEN_INSTANCE_STATUSES.has(status)) {
        accumulator.frozenCount += 1;
      } else if (status === "Error") {
        accumulator.errorCount += 1;
      }

      if (type === "container") {
        accumulator.containerCount += 1;
      } else if (type === "virtual-machine") {
        accumulator.virtualMachineCount += 1;
      }

      return accumulator;
    },
    { ...INITIAL_INSTANCE_DISTRIBUTION },
  );
};
