import type { LxdMetricGroup } from "types/metrics";
import type { LxdInstance } from "types/instance";

interface DiskDeviceUsage {
  device: string;
  free: number;
  total: number;
}

interface MemoryReport {
  memory:
    | {
        free: number;
        total: number;
        cached: number;
      }
    | undefined;
  rootDisk:
    | {
        free: number;
        total: number;
      }
    | undefined;
  otherDisks: DiskDeviceUsage[];
}

export const getInstanceMetrics = (
  metrics: LxdMetricGroup[],
  instance: LxdInstance,
): MemoryReport => {
  const memValue = (metricKey: string) =>
    metrics
      .find((item) => item.name === metricKey)
      ?.metrics.find(
        (item) =>
          item.labels.name === instance.name &&
          item.labels.project === instance.project,
      )?.value;

  const memFree = memValue("lxd_memory_MemFree_bytes");
  const memCached = memValue("lxd_memory_Cached_bytes");
  const memTotal = memValue("lxd_memory_MemTotal_bytes");
  const memory =
    memFree && memTotal && memCached
      ? {
          free: memFree,
          total: memTotal,
          cached: memCached,
        }
      : undefined;

  const diskMetrics = (metricKey: string) =>
    metrics
      .find((item) => item.name === metricKey)
      ?.metrics.filter(
        (item) =>
          item.labels.name === instance.name &&
          item.labels.project === instance.project,
      );

  const diskFree = diskMetrics("lxd_filesystem_free_bytes");
  const diskTotal = diskMetrics("lxd_filesystem_size_bytes");

  let rootDisk: DiskDeviceUsage | undefined = undefined;
  const otherDisks: DiskDeviceUsage[] = [];

  diskFree?.forEach((metric) => {
    const device = metric.labels.device;
    const free = metric.value;
    const total = diskTotal?.find(
      (item) => item.labels.device === device,
    )?.value;

    if (!free || !total || !device || total == 0) {
      return;
    }

    if (metric.labels.mountpoint === "/") {
      rootDisk = {
        device,
        free,
        total,
      };
    } else {
      otherDisks.push({
        device,
        free,
        total,
      });
    }
  });

  otherDisks.sort((a, b) => a.device.localeCompare(b.device));

  return {
    memory,
    rootDisk,
    otherDisks,
  };
};
