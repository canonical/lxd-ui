import { useResources } from "context/useResources";
import type { FC } from "react";
import { useNotify } from "@canonical/react-components";
import type { InputProps } from "@canonical/react-components";
import { Input } from "@canonical/react-components";
import { ensureArray } from "context/useResourceLimit";

type Props = InputProps;

export const ProjectCpuLimitInput: FC<Props> = ({ help, ...props }) => {
  const notify = useNotify();

  const { data: resources = [], error } = useResources();
  if (error) {
    notify.failure("Loading resources failed", error);
  }
  const limitSum = ensureArray(resources).reduce(
    (sum, resource) => sum + resource.cpu.total,
    0,
  );
  const hasLimits = limitSum > 0;
  const limitText = hasLimits ? (
    <>
      Total number of CPU cores: <b>{limitSum}</b>
    </>
  ) : null;

  const helpText = (
    <>
      {help}
      {help && limitText && <br />}
      {limitText}
    </>
  );

  return <Input {...props} help={helpText} />;
};
