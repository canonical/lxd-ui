import type { LxdProject } from "types/project";

export type ResourceLimitSource = "project" | "cluster-member";

export interface ResourceLimit {
  min: number;
  max: number;
  sourceType?: ResourceLimitSource;
  sourceName?: string;
}
export const getResourceLimit = (
  resources: number[],
  clusterMember: string | undefined,
  project?: LxdProject,
  projectLimit?: number,
): ResourceLimit => {
  const minResource = Math.min(...resources);
  const maxResource = Math.max(...resources);

  if (
    resources.length === 0 ||
    (projectLimit && Number(projectLimit) < minResource)
  ) {
    return {
      min: Number(projectLimit),
      max: Number(projectLimit),
      sourceType: projectLimit ? "project" : undefined,
      sourceName: projectLimit ? (project?.name ?? "default") : undefined,
    };
  }

  if (!projectLimit || maxResource < projectLimit) {
    return {
      min: minResource,
      max: maxResource,
      sourceType: clusterMember ? "cluster-member" : undefined,
      sourceName: clusterMember,
    };
  }

  return {
    min: minResource,
    max: projectLimit,
    sourceType: undefined,
    sourceName: undefined,
  };
};
