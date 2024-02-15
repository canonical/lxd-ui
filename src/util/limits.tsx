import {
  BYTES_UNITS,
  CPU_LIMIT_TYPE,
  CpuLimit,
  MEM_LIMIT_TYPE,
  MemoryLimit,
} from "types/limits";

export const cpuLimitToPayload = (
  cpuLimit: CpuLimit | string | undefined,
): string | undefined => {
  if (!cpuLimit) {
    return undefined;
  }
  if (typeof cpuLimit === "string") {
    return cpuLimit;
  }
  switch (cpuLimit.selectedType) {
    case CPU_LIMIT_TYPE.DYNAMIC:
      return cpuLimit.dynamicValue?.toString();
    case CPU_LIMIT_TYPE.FIXED:
      if (
        cpuLimit.fixedValue?.includes(",") ||
        cpuLimit.fixedValue?.includes("-")
      ) {
        return cpuLimit.fixedValue;
      }
      if (cpuLimit.fixedValue) {
        const singleValue = +cpuLimit.fixedValue;
        return `${singleValue}-${singleValue}`;
      }
      return undefined;
  }
};

export const parseCpuLimit = (limit?: string): CpuLimit | undefined => {
  if (!limit) {
    return undefined;
  }

  if (limit.includes(",") || limit.includes("-")) {
    return {
      fixedValue: limit,
      selectedType: CPU_LIMIT_TYPE.FIXED,
    };
  }

  return {
    dynamicValue: parseInt(limit),
    selectedType: CPU_LIMIT_TYPE.DYNAMIC,
  };
};

export const memoryLimitToPayload = (
  memoryLimit: MemoryLimit | undefined | string,
): string | undefined => {
  if (typeof memoryLimit === "string") {
    return memoryLimit;
  }
  if (!memoryLimit?.value) {
    return undefined;
  }
  return `${memoryLimit.value}${memoryLimit.unit}`;
};

export const parseMemoryLimit = (limit?: string): MemoryLimit | undefined => {
  if (!limit) {
    return undefined;
  }
  if (limit.includes("%")) {
    return {
      value: parseInt(limit),
      unit: "%",
      selectedType: MEM_LIMIT_TYPE.PERCENT,
    };
  }
  return {
    value: parseInt(limit),
    unit: limit.replace(/[0-9]/g, "") as BYTES_UNITS,
    selectedType: MEM_LIMIT_TYPE.FIXED,
  };
};
