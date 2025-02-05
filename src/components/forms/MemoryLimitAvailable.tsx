import { FC } from "react";
import { useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "api/server";
import { queryKeys } from "util/queryKeys";
import { humanFileSize } from "util/helpers";
import Loader from "components/Loader";
import { limitToBytes } from "util/limits";
import { LxdProject } from "types/project";

type Props = {
  project?: LxdProject;
};

const MemoryLimitAvailable: FC<Props> = ({ project }) => {
  const notify = useNotify();

  const {
    data: resources,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: fetchResources,
  });

  if (isLoading) {
    return <Loader text="Loading resources..." />;
  }

  if (error) {
    notify.failure("Loading resources failed", error);
  }

  const getAvailableMemory = () => {
    if (!project?.config["limits.memory"]) {
      return resources?.memory.total;
    }
    if (!resources?.memory.total) {
      return limitToBytes(project.config["limits.memory"]);
    }
    return Math.min(
      resources.memory.total,
      Number(limitToBytes(project.config["limits.memory"])),
    );
  };

  const maxMemory = getAvailableMemory();

  return maxMemory ? (
    <>
      Total memory: <b>{humanFileSize(maxMemory)}</b>
    </>
  ) : null;
};

export default MemoryLimitAvailable;
