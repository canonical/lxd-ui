export enum BYTES_UNITS {
  B = "B",
  KB = "kB",
  MB = "MB",
  GB = "GB",
  TB = "TB",
  PB = "PB",
  EB = "EB",
  KIB = "KiB",
  MIB = "MiB",
  GIB = "GiB",
  TIB = "TiB",
  PIB = "PiB",
  EIB = "EiB",
}

export enum MEM_LIMIT_TYPE {
  FIXED = 0,
  PERCENT = 1,
}

export interface MemoryLimit {
  value?: number;
  unit: BYTES_UNITS | "%";
  selectedType: MEM_LIMIT_TYPE;
}

export enum CPU_LIMIT_TYPE {
  DYNAMIC = 0,
  FIXED_RANGE = 1,
  FIXED_SET = 2,
}

export interface CpuLimit {
  dynamicValue?: number;
  rangeValue?: {
    from: number | null;
    to: number | null;
  };
  setValue?: string;
  selectedType: CPU_LIMIT_TYPE;
}
