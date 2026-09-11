import type { LxdInstanceStatus, LxdInstance } from "types/instance";
import { capitalizeFirstLetter } from "util/helpers";

export type OverviewInstanceStatus = "running" | "stopped" | "frozen" | "error";

export const OVERVIEW_INSTANCE_STATUSES: OverviewInstanceStatus[] = [
  "running",
  "stopped",
  "frozen",
  "error",
];

const OVERVIEW_INSTANCE_STATUS_COLORS: Record<OverviewInstanceStatus, string> =
  {
    running: "var(--vf-color-button-positive-default)",
    stopped: "var(--vf-color-text-default)",
    frozen: "var(--vf-color-link-default)",
    error: "var(--vf-color-button-negative-default)",
  };

export const getInstanceStatusColor = (
  status: OverviewInstanceStatus,
): string => OVERVIEW_INSTANCE_STATUS_COLORS[status];

export const getInstanceStatusFilterHref = (
  status: OverviewInstanceStatus,
  instancesUrl: string,
): string => {
  const params = new URLSearchParams();
  params.append("status", capitalizeFirstLetter(status));
  return `${instancesUrl}?${params.toString()}`;
};

export interface InstanceDistribution {
  status: Record<OverviewInstanceStatus, number>;
  containerCount: number;
  virtualMachineCount: number;
}

const FROZEN_INSTANCE_STATUSES = new Set<LxdInstanceStatus>([
  "Freezing",
  "Frozen",
]);

const INITIAL_INSTANCE_DISTRIBUTION: InstanceDistribution = {
  status: {
    running: 0,
    stopped: 0,
    frozen: 0,
    error: 0,
  },
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
        accumulator.status.running += 1;
      } else if (status === "Stopped") {
        accumulator.status.stopped += 1;
      } else if (FROZEN_INSTANCE_STATUSES.has(status)) {
        accumulator.status.frozen += 1;
      } else if (status === "Error") {
        accumulator.status.error += 1;
      }

      if (type === "container") {
        accumulator.containerCount += 1;
      } else if (type === "virtual-machine") {
        accumulator.virtualMachineCount += 1;
      }

      return accumulator;
    },
    {
      ...INITIAL_INSTANCE_DISTRIBUTION,
      status: { ...INITIAL_INSTANCE_DISTRIBUTION.status },
    },
  );
};

export interface InstanceStatusSegment {
  color: string;
  href: string;
  tooltip: string;
  value: number;
}

export const getInstanceStatusSegments = (
  statusCounts: Record<OverviewInstanceStatus, number>,
  instancesUrl: string,
): InstanceStatusSegment[] => {
  return OVERVIEW_INSTANCE_STATUSES.filter(
    (status) => statusCounts[status] > 0,
  ).map((status) => ({
    color: getInstanceStatusColor(status),
    href: getInstanceStatusFilterHref(status, instancesUrl),
    tooltip: `${statusCounts[status]} ${capitalizeFirstLetter(status)}`,
    value: statusCounts[status],
  }));
};
