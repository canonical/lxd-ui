import type { Dispatch, FC, SetStateAction } from "react";
import { CheckboxInput } from "@canonical/react-components";

interface Props {
  label: string;
  confirmed: [boolean, Dispatch<SetStateAction<boolean>>];
}

const ConfirmationCheckbox: FC<Props> = ({ label, confirmed }) => {
  const [isConfirmed, setConfirmed] = confirmed;

  return (
    <span className="u-float-left">
      <CheckboxInput
        key={`confirmation-checkbox-${isConfirmed}`}
        inline
        label={label}
        tabIndex={-1}
        defaultChecked={isConfirmed}
        onChange={() => {
          setConfirmed((prev) => !prev);
        }}
      />
    </span>
  );
};

export default ConfirmationCheckbox;
