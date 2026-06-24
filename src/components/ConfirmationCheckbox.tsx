import type { Dispatch, FC, SetStateAction } from "react";
import { CheckboxInput } from "@canonical/react-components";

interface Props {
  label: string;
  confirmed: [boolean, Dispatch<SetStateAction<boolean>>];
  disabled?: boolean;
}

const ConfirmationCheckbox: FC<Props> = ({ label, confirmed, disabled }) => {
  const [isConfirmed, setConfirmed] = confirmed;

  return (
    <CheckboxInput
      key={`confirmation-checkbox-${isConfirmed}`}
      inline
      label={label}
      defaultChecked={isConfirmed}
      onChange={() => {
        setConfirmed((prev) => !prev);
      }}
      disabled={disabled}
      className="confirmation-checkbox"
    />
  );
};

export default ConfirmationCheckbox;
