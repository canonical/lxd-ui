import React, { FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  isSubmitting: boolean;
  isDisabled: boolean;
  buttonLabel: string;
  appearance?: string;
  processingText?: string;
  onClick?: () => void;
}

const SubmitButton: FC<Props> = ({
  isSubmitting,
  isDisabled,
  buttonLabel,
  appearance = "positive",
  processingText = "Processing...",
  onClick,
}) => {
  return isSubmitting ? (
    <Button appearance={appearance} type="submit" hasIcon disabled>
      <i
        className={
          appearance === "positive"
            ? "p-icon--spinner is-light u-animation--spin"
            : "p-icon--spinner u-animation--spin"
        }
      ></i>{" "}
      <span>{processingText}</span>
    </Button>
  ) : (
    <Button
      appearance={appearance}
      type="submit"
      disabled={isDisabled}
      onClick={onClick}
    >
      {buttonLabel}
    </Button>
  );
};

export default SubmitButton;
