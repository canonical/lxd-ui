import type { FC } from "react";
import { Step, Stepper } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  variant?: "horizontal" | "vertical";
  step2Name?: string;
}

const AuthenticationTlsStepper: FC<Props> = ({
  variant,
  step2Name = "Identity trust token",
}) => {
  const navigate = useNavigate();

  return (
    <Stepper
      variant={variant}
      steps={[
        <Step
          key="Step 1"
          handleClick={() => {
            navigate(`${ROOT_PATH}/ui/login/certificate-generate`);
          }}
          index={1}
          title="Browser certificate"
          hasProgressLine={false}
          enabled
          iconName="number"
          selected={location.pathname.includes("certificate-generate")}
          iconClassName="stepper-icon"
        />,
        <Step
          key="Step 2"
          handleClick={() => {
            navigate(`${ROOT_PATH}/ui/login/certificate-add`);
          }}
          index={2}
          title={step2Name}
          hasProgressLine={false}
          enabled
          iconName="number"
          selected={location.pathname.includes("certificate-add")}
        />,
      ]}
    />
  );
};

export default AuthenticationTlsStepper;
