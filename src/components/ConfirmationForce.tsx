import { Dispatch, FC, SetStateAction } from "react";
import { CheckboxInput } from "@canonical/react-components";

interface Props {
  label: string;
  force: [boolean, Dispatch<SetStateAction<boolean>>];
}

const ConfirmationForce: FC<Props> = ({ label, force }) => {
  const [isForce, setForce] = force;

  return (
    <span className="u-float-left">
      <CheckboxInput
        inline
        label={label}
        tabIndex={-1}
        defaultChecked={isForce}
        onClick={() => setForce((prev) => !prev)}
      />
    </span>
  );
};

export default ConfirmationForce;
