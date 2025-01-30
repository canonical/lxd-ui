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

const getUnitExponent = (unit: BYTES_UNITS): number => {
  switch (unit) {
    case BYTES_UNITS.B:
      return 1;
    case BYTES_UNITS.KB:
      return 10 ** 3;
    case BYTES_UNITS.MB:
      return 10 ** 6;
    case BYTES_UNITS.GB:
      return 10 ** 9;
    case BYTES_UNITS.TB:
      return 10 ** 12;
    case BYTES_UNITS.PB:
      return 10 ** 15;
    case BYTES_UNITS.EB:
      return 10 ** 18;
    case BYTES_UNITS.KIB:
      return 2 ** 10;
    case BYTES_UNITS.MIB:
      return (2 ** 10) ** 2;
    case BYTES_UNITS.GIB:
      return (2 ** 10) ** 3;
    case BYTES_UNITS.TIB:
      return (2 ** 10) ** 4;
    case BYTES_UNITS.PIB:
      return (2 ** 10) ** 5;
    case BYTES_UNITS.EIB:
      return (2 ** 10) ** 6;
  }
};

export const limitToBytes = (limit?: string): number => {
  const value = parseMemoryLimit(limit);
  if (value?.value && value.unit !== "%") {
    return value.value * getUnitExponent(value.unit);
  } else {
    return 0;
  }
};

export const formatBytes = (bytes: number, unit: BYTES_UNITS): number => {
  return bytes / getUnitExponent(unit);
};
