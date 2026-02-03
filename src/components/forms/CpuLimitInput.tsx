import type { FC } from "react";
import { Input } from "@canonical/react-components";
import type { Props as InputProps } from "@canonical/react-components/dist/components/Input/Input";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";
import { CpuLimitAvailable } from "./CpuLimitAvailable";

type Props = {
  formik: InstanceAndProfileFormikProps;
  help?: string;
} & InputProps;

const CpuLimitInput: FC<Props> = ({ help, formik, ...props }) => {
  const cpuLimit = <CpuLimitAvailable formik={formik} />;
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
