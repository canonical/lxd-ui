import { CPU_LIMIT_TYPE, CpuLimit } from "types/limits";

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

export const boolPayload = (val?: boolean) => {
  if (val === undefined) {
    return undefined;
  }

  return val ? "true" : "false";
};
