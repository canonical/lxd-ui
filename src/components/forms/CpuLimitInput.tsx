import type { FC } from "react";
import { Input } from "@canonical/react-components";
import type { Props as InputProps } from "@canonical/react-components/dist/components/Input/Input";
import type { LxdProject } from "types/project";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { CpuLimitAvailable } from "./CpuLimitAvailable";

type Props = {
  formik: InstanceAndProfileFormikProps;
  help?: string;
  project?: LxdProject;
} & InputProps;

const CpuLimitInput: FC<Props> = ({ help, project, formik, ...props }) => {
  const cpuLimit = <CpuLimitAvailable project={project} formik={formik} />;
  return (
    <Input
      {...props}
      help={
        <>
          {help}
          {help && cpuLimit && <br />}
          {cpuLimit}
        </>
      }
    />
  );
};

export default CpuLimitInput;
