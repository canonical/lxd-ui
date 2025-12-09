import { useResources } from "context/useResources";
import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import { useNotify } from "@canonical/react-components";
import { Spinner } from "@canonical/react-components";

export const ProjectMemoryLimit: FC = () => {
  const notify = useNotify();

  const { data: resources = [], error, isLoading } = useResources();
  if (isLoading) {
    return <Spinner className="u-loader" text="Loading resources..." />;
  }
  if (error) {
    notify.failure("Loading resources failed", error);
    return null;
  }
  const resourceArray = Array.isArray(resources) ? resources : [resources];

  const sumMemoryLimit = resourceArray.reduce(
    (sum, resource) => sum + resource.memory.total,
    0,
  );

  return (
    <>
      Total memory: <b>{humanFileSize(sumMemoryLimit)}</b>
    </>
  );
};
