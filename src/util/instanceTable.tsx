export const STATUS = "Status";
export const NAME = "Name";
export const TYPE = "Type";
export const CLUSTER_MEMBER = "Cluster member";
export const DESCRIPTION = "Description";
export const MEMORY = "Memory";
export const DISK = "Root disk";
export const IPV4 = "IPv4";
export const IPV6 = "IPv6";
export const SNAPSHOTS = "Snapshots";
export const PROJECT = "Project";
export const ACTIONS = "Actions";

export const COLUMN_WIDTHS: Record<string, number> = {
  [NAME]: 170,
  [TYPE]: 130,
  [CLUSTER_MEMBER]: 150,
  [MEMORY]: 150,
  [DISK]: 150,
  [DESCRIPTION]: 150,
  [IPV4]: 150,
  [IPV6]: 330,
  [SNAPSHOTS]: 110,
  [PROJECT]: 160,
  [STATUS]: 160,
  [ACTIONS]: 210,
};

export const SIZE_HIDEABLE_COLUMNS = [
  SNAPSHOTS,
  IPV6,
  IPV4,
  DESCRIPTION,
  MEMORY,
  DISK,
  TYPE,
  STATUS,
];

export const CREATION_SPAN_COLUMNS = [
  TYPE,
  MEMORY,
  DISK,
  IPV4,
  IPV6,
  SNAPSHOTS,
];
