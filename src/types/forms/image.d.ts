import type { LxdImageRegistryProtocol } from "../image";
export interface ImageRegistryFormValues {
  name: string;
  protocol: LxdImageRegistryProtocol;
  description?: string;
  url?: string;
  cluster?: string;
  sourceProject?: string;
}
