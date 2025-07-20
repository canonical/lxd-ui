import type { FC } from "react";
import { useEffect } from "react";
import { useState } from "react";
import Meter from "components/Meter";
import type { CpuUsage } from "util/metricSelectors";
import { getCpuUsage } from "util/metricSelectors";
import type { LxdInstance } from "types/instance";
import { useMetricHistory } from "context/metricHistory";

interface Props {
  cpu?: CpuUsage;
  instance: LxdInstance;
}

const InstanceUsageCpu: FC<Props> = ({ instance }) => {
  const { getMetricHistory } = useMetricHistory();
  const metricHistory = getMetricHistory();
  const [loadingSeconds, setLoadingSeconds] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingSeconds((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const calculateCpuUsage = () => {
    if (metricHistory.length === 0) {
      return null;
    }

    const nowEntryId = metricHistory.length - 1;
    const nowCpu = getCpuUsage(metricHistory[nowEntryId], instance);
    if (!nowCpu) {
      return null;
    }

    let prevCpu = null;
    for (let i = metricHistory.length - 2; i >= 0; i--) {
      prevCpu = getCpuUsage(metricHistory[i], instance);
      if (prevCpu?.cpuSecondsTotal != nowCpu.cpuSecondsTotal) {
        break;
      }
    }
    if (!prevCpu) {
      return null;
    }

    const getSecondsBusy = () => {
      const nowSeconds = nowCpu.cpuSecondsTotal - nowCpu.cpuSecondsIdle;
      const prevSeconds = prevCpu.cpuSecondsTotal - prevCpu.cpuSecondsIdle;
      return nowSeconds - prevSeconds;
    };

    const getCoreCount = () => {
      if (nowCpu.coreCount > 0) {
        return nowCpu.coreCount;
      }

      // fall back to instance config for VMs, which often have a 0 value for cores in metrics
      const cpuLimit = instance.expanded_config["limits.cpu"];
      if (cpuLimit) {
        const limit = parseInt(cpuLimit);
        return limit > 0 ? limit : 1;
      }

      // fall back to single core
      return 1;
    };

    const busySeconds = getSecondsBusy();
    const cores = getCoreCount();
    const totalSeconds = (nowCpu.time - prevCpu.time) * cores;
    const result = (100 * busySeconds) / totalSeconds;

    if (result < 0) {
      return null;
    }

    return Math.min(result, 100);
  };

  const cpuUsage = calculateCpuUsage();
  if (cpuUsage === null) {
    return (
      <div
        className="u-text--muted p-text--small"
        key={loadingSeconds > 0 ? loadingSeconds : "long"}
      >
        loading
        {loadingSeconds > 0
          ? `, ${loadingSeconds} seconds remaining to first CPU snapshot`
          : " takes longer than expected"}
      </div>
    );
  }

  return (
    <div>
      <Meter
        percentage={cpuUsage}
        text={`${Math.round(cpuUsage * 100) / 100}%`}
      />
    </div>
  );
};

export default InstanceUsageCpu;
