import type { FC } from "react";
import type { ResourceLimitSource } from "util/resourceLimits";
import ResourceLink from "./ResourceLink";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  source: string;
  sourceType?: ResourceLimitSource;
}

export const ResourceLimitIcon: FC<Props> = ({ source, sourceType }) => {
  if (sourceType === "project") {
    return (
      <>
        {"in project "}
        <ResourceLink
          type="project"
          value={source}
          to={`${ROOT_PATH}/ui/projects/${encodeURIComponent(source)}`}
        />
      </>
    );
  }

  if (sourceType === "cluster-member") {
    return (
      <>
        {"on cluster member "}
        <ResourceLink
          type="cluster-member"
          value={source}
          to={`${ROOT_PATH}/ui/cluster/member/${encodeURIComponent(source)}`}
        />
      </>
    );
  }
  return null;
};
