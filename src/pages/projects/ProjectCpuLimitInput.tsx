import { useResources } from "context/useResources";
import type { FC } from "react";
import { useNotify } from "@canonical/react-components";
import { Spinner } from "@canonical/react-components";
import type { InputProps } from "@canonical/react-components";
import { Input } from "@canonical/react-components";

type Props = InputProps;

export const ProjectCpuLimitInput: FC<Props> = ({ help, ...props }) => {
  const notify = useNotify();

  const { data: resources = [], error, isLoading } = useResources();
  let sumCpuLimit = null;
  if (isLoading) {
    sumCpuLimit = <Spinner className="u-loader" text="Loading resources..." />;
  }
  if (error) {
    notify.failure("Loading resources failed", error);
    sumCpuLimit = null;
  }
  if (resources) {
    const resourceArray = Array.isArray(resources) ? resources : [resources];
    sumCpuLimit = resourceArray.reduce(
      (sum, resource) => sum + resource.cpu.total,
      0,
    );
  }
  const sumCpuLimitText = sumCpuLimit ? (
    <>
      Total number of CPU cores: <b>{sumCpuLimit}</b>
    </>
  ) : (
    ""
  );

  const helpText = (
    <>
      {help} {help && sumCpuLimitText && <br />}
      {sumCpuLimitText}
    </>
  );

  return <Input {...props} help={helpText} />;
};
