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
  const isVm = instance.type === "virtual-machine";
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

    const totalDiff = nowCpu.cpuSecondsTotal - prevCpu.cpuSecondsTotal;
    const idleDiff = nowCpu.cpuSecondsIdle - prevCpu.cpuSecondsIdle;

    if (isVm && totalDiff === 0) {
      return null;
    }

    if (isVm) {
      return (100 * (totalDiff - idleDiff)) / totalDiff;
    } else {
      const timeDiff = (nowCpu.time - prevCpu.time) * nowCpu.coreCount;
      return (100 * totalDiff) / timeDiff;
    }
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
