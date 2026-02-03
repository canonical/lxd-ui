export interface LocalPeeringFormValues {
  name: string;
  targetProject: string;
  targetNetwork: string;
  description?: string;
  customTargetProject?: string;
  customTargetNetwork?: string;
  createMutualPeering?: boolean;
}
