import type { LxdMetric, LxdMetricGroup } from "types/metrics";
import type { LxdInstance } from "types/instance";
import type { MetricHistoryEntry } from "context/metricHistory";

export interface CpuUsage {
  coreCount: number;
  cpuSecondsIdle: number;
  cpuSecondsTotal: number;
  time: number;
}

export interface FilesystemUsage {
  device: string;
  free: number;
  total: number;
}

export interface MemoryUsage {
  cached: number;
  free: number;
  total: number;
}

interface InstanceMetricReport {
  memory: MemoryUsage | undefined;
  otherFilesystems: FilesystemUsage[];
  rootFilesystem: FilesystemUsage | undefined;
}

export const getInstanceMetricReport = (
  metrics: LxdMetricGroup[],
  instance: LxdInstance,
): InstanceMetricReport => {
  const memory = getMemoryUsage(metrics, instance);
  const [rootFilesystem, otherFilesystems] = getFilesystemUsage(
    metrics,
    instance,
  );

  return {
    memory,
    rootFilesystem,
    otherFilesystems,
  };
};

export const getMemoryUsage = (
  metrics: LxdMetricGroup[],
  instance: LxdInstance,
): MemoryUsage | undefined => {
  const memFree = findMetric("lxd_memory_MemFree_bytes", metrics, instance);
  const memCached = findMetric("lxd_memory_Cached_bytes", metrics, instance);
  const memTotal = findMetric("lxd_memory_MemTotal_bytes", metrics, instance);

  if (!memFree.length || !memTotal.length || !memCached.length) {
    return undefined;
  }

  const free = Number.parseFloat(memFree[0].value);
  const total = Number.parseFloat(memTotal[0].value);
  const cached = Number.parseFloat(memCached[0].value);

  // sanity check, LXD might report a higher free value than total memory on frozen VMs
  if (free > total || cached > total) {
    return undefined;
  }

  return {
    free,
    total,
    cached,
  };
};

export const getFilesystemUsage = (
  metrics: LxdMetricGroup[],
  instance: LxdInstance,
): [FilesystemUsage | undefined, FilesystemUsage[]] => {
  const freeMetrics = findMetric(
    "lxd_filesystem_free_bytes",
    metrics,
    instance,
  );
  const totalMetrics = findMetric(
    "lxd_filesystem_size_bytes",
    metrics,
    instance,
  );

  let root: FilesystemUsage | undefined = undefined;
  const other: FilesystemUsage[] = [];

  freeMetrics?.forEach((metric) => {
    const device = metric.labels.device;
    const free = metric.value;
    const total = totalMetrics?.find(
      (item) => item.labels.device === device,
    )?.value;

    if (!free || !total || total === "0") {
      return;
    }

    if (metric.labels.mountpoint === "/") {
      root = {
        device: "/",
        free: Number.parseFloat(free),
        total: Number.parseFloat(total),
      };
    } else {
      other.push({
        device: device ?? "",
        free: Number.parseFloat(free),
        total: Number.parseFloat(total),
      });
    }
  });

  other.sort((a, b) => a.device.localeCompare(b.device));

  return [root, other];
};

export const getCpuUsage = (
  metrics: MetricHistoryEntry,
  instance: LxdInstance,
): CpuUsage | undefined => {
  const cpuMetric = findMetric(
    "lxd_cpu_seconds_total",
    metrics.metric,
    instance,
  );
  const cpuCoreCount = findMetric(
    "lxd_cpu_effective_total",
    metrics.metric,
    instance,
  );

  let cpuSecondsTotal = 0;
  let cpuSecondsIdle = 0;
  cpuMetric?.forEach((metric) => {
    const cpu = metric.labels.cpu;
    const value = metric.value as unknown as string;
    const mode = metric.labels.mode;

    if (!cpu || !value || !mode) {
      return;
    }

    // sum values for each core
    cpuSecondsTotal += parseFloat(value);
    if (mode === "idle" || mode === "iowait") {
      cpuSecondsIdle += parseFloat(value);
    }
  });

  if (!cpuSecondsTotal) {
    return undefined;
  }

  const coreCount =
    cpuCoreCount.length > 0 ? Number.parseInt(cpuCoreCount[0].value) : 1;

  return {
    coreCount,
    cpuSecondsIdle,
    cpuSecondsTotal,
    time: metrics.time,
  };
};

const findMetric = (
  name: string,
  metrics: LxdMetricGroup[],
  instance: LxdInstance,
): LxdMetric[] => {
  return (
    metrics
      .find((item) => item.name === name)
      ?.metrics.filter(
        (item) =>
          item.labels.name === instance.name &&
          item.labels.project === instance.project,
      ) ?? []
  );
};
