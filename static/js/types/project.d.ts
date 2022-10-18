export interface LxdProject {
  name: string;
  config: {
    "features.images": boolean;
    "features.networks": boolean;
    "features.profiles": boolean;
    "features.storage.volumes": boolean;
  };
  description: string;
  used_by?: string[];
}
