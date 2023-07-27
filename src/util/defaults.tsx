import { LxdDiskDevice, LxdNicDevice } from "types/device";
import {
  CpuLimit,
  CPU_LIMIT_TYPE,
  MemoryLimit,
  MEM_LIMIT_TYPE,
  BYTES_UNITS,
} from "types/limits";

export const DEFAULT_NIC_DEVICE: LxdNicDevice = {
  name: "",
  network: "",
  type: "nic",
};

export const DEFAULT_DISK_DEVICE: LxdDiskDevice = {
  path: "/",
  pool: "",
  type: "disk",
};

export const DEFAULT_CPU_LIMIT: CpuLimit = {
  selectedType: CPU_LIMIT_TYPE.DYNAMIC,
};

export const DEFAULT_MEM_LIMIT: MemoryLimit = {
  unit: BYTES_UNITS.GIB,
  selectedType: MEM_LIMIT_TYPE.FIXED,
};
