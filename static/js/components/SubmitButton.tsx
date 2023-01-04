import React, { FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  isSubmitting: boolean;
  isDisabled: boolean;
  buttonLabel: string;
  processingText?: string;
  onClick?: () => void;
}

const SubmitButton: FC<Props> = ({
  isSubmitting,
  isDisabled,
  buttonLabel,
  processingText = "Processing...",
  onClick,
}) => {
  return isSubmitting ? (
    <Button appearance="positive" type="submit" hasIcon disabled>
      <i className="p-icon--spinner is-light u-animation--spin"></i>{" "}
      <span>{processingText}</span>
    </Button>
  ) : (
    <Button
      appearance="positive"
      type="submit"
      disabled={isDisabled}
      onClick={onClick}
    >
      {buttonLabel}
    </Button>
  );
};

export default SubmitButton;
