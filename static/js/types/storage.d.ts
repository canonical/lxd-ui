export interface LxdStorage {
  config: {
    "volume.block.filesystem": string;
    "volume.size": string;
  };
  description: string;
  driver: string;
  locations: string[];
  name: string;
  status: string;
  used_by?: string[];
}
