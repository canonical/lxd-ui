import { CPU_LIMIT_TYPE, CpuLimit } from "types/limits";

export const cpuLimitToPayload = (cpuLimit: CpuLimit) => {
  switch (cpuLimit.selectedType) {
    case CPU_LIMIT_TYPE.DYNAMIC:
      if (cpuLimit.dynamicValue) {
        return `${cpuLimit.dynamicValue}`;
      }
      return null;
    case CPU_LIMIT_TYPE.FIXED_RANGE:
      if (!cpuLimit.rangeValue) return null;
      if (
        cpuLimit.rangeValue.from !== null &&
        cpuLimit.rangeValue.to !== null
      ) {
        return `${cpuLimit.rangeValue.from}-${cpuLimit.rangeValue.to}`;
      }
      return null;
    case CPU_LIMIT_TYPE.FIXED_SET:
      if (cpuLimit.setValue) {
        if (cpuLimit.setValue.includes(",")) {
          return cpuLimit.setValue;
        }
        const singleValue = +cpuLimit.setValue;
        return `${singleValue}-${singleValue}`;
      }
      return null;
  }
};
