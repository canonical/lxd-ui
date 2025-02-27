import type { FC } from "react";
import { Input, useNotify } from "@canonical/react-components";
import type { Props as InputProps } from "@canonical/react-components/dist/components/Input/Input";
import type { LxdProject } from "types/project";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchResources } from "api/server";
import Loader from "components/Loader";
import { useServerEntitlements } from "util/entitlements/server";

type Props = {
  help?: string;
  project?: LxdProject;
} & InputProps;

const CpuLimitInput: FC<Props> = ({ help, project, ...props }) => {
  const notify = useNotify();
  const { canViewResources } = useServerEntitlements();

  const {
    data: resources,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: fetchResources,
    enabled: canViewResources(),
  });

  if (isLoading) {
    return <Loader text="Loading resources..." />;
  }

  if (error) {
    notify.failure("Loading resources failed", error);
  }

  const getNumberOfCores = () => {
    if (!project?.config["limits.cpu"]) {
      return resources?.cpu.total;
    }
    if (!resources?.cpu.total) {
      return project.config["limits.cpu"];
    }
    return Math.min(resources.cpu.total, Number(project.config["limits.cpu"]));
  };

  const numberOfCores = getNumberOfCores();
  const totalAvailable = numberOfCores ? (
    <>
      Total number of CPU cores: <b>{numberOfCores}</b>
    </>
  ) : null;

  return (
    <Input
      {...props}
      help={
        <>
          {help}
          {totalAvailable}
        </>
      }
    />
  );
};

export default CpuLimitInput;
