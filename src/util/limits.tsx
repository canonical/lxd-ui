import {
  BYTES_UNITS,
  CPU_LIMIT_TYPE,
  CpuLimit,
  MEM_LIMIT_TYPE,
  MemoryLimit,
} from "types/limits";

export const cpuLimitToPayload = (cpuLimit: CpuLimit) => {
  switch (cpuLimit.selectedType) {
    case CPU_LIMIT_TYPE.DYNAMIC:
      if (cpuLimit.dynamicValue) {
        return `${cpuLimit.dynamicValue}`;
      }
      return undefined;
    case CPU_LIMIT_TYPE.FIXED_RANGE:
      if (!cpuLimit.rangeValue) return undefined;
      if (
        cpuLimit.rangeValue.from !== null &&
        cpuLimit.rangeValue.to !== null
      ) {
        return `${cpuLimit.rangeValue.from}-${cpuLimit.rangeValue.to}`;
      }
      return undefined;
    case CPU_LIMIT_TYPE.FIXED_SET:
      if (cpuLimit.setValue) {
        if (cpuLimit.setValue.includes(",")) {
          return cpuLimit.setValue;
        }
        const singleValue = +cpuLimit.setValue;
        return `${singleValue}-${singleValue}`;
      }
      return undefined;
  }
};

export const parseCpuLimit = (limit?: string): CpuLimit => {
  if (limit?.includes("-")) {
    const from = limit.split("-")[0];
    const to = limit.split("-")[1];
    return {
      rangeValue: {
        from: from ? parseInt(from) : null,
        to: to ? parseInt(to) : null,
      },
      selectedType: CPU_LIMIT_TYPE.FIXED_RANGE,
    };
  }

  if (limit?.includes(",")) {
    return {
      setValue: limit,
      selectedType: CPU_LIMIT_TYPE.FIXED_SET,
    };
  }

  return {
    dynamicValue: limit ? parseInt(limit) : undefined,
    selectedType: CPU_LIMIT_TYPE.DYNAMIC,
  };
};

export const parseMemoryLimit = (limit?: string): MemoryLimit => {
  if (limit?.includes("%") || !limit) {
    return {
      value: limit ? parseInt(limit) : undefined,
      unit: "%",
      selectedType: MEM_LIMIT_TYPE.PERCENT,
    };
  }
  return {
    value: limit ? parseInt(limit) : undefined,
    unit: limit.replace(/[0-9]/g, "") as BYTES_UNITS,
    selectedType: MEM_LIMIT_TYPE.FIXED,
  };
};
