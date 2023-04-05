import React, { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  isSubmitting: boolean;
  isDisabled: boolean;
  buttonLabel: string;
  appearance?: string;
  processingText?: string;
  onClick?: () => void;
  dense?: boolean;
}

const SubmitButton: FC<Props> = ({
  isSubmitting,
  isDisabled,
  buttonLabel,
  appearance = "positive",
  processingText = "Processing...",
  onClick,
  dense,
}) => {
  return isSubmitting ? (
    <Button
      appearance={appearance}
      type="submit"
      hasIcon
      disabled
      dense={dense}
    >
      <Icon
        name="spinner"
        className={classnames("u-animation--spin", {
          "is-light": appearance === "positive",
        })}
      />{" "}
      <span>{processingText}</span>
    </Button>
  ) : (
    <Button
      appearance={appearance}
      type="submit"
      disabled={isDisabled}
      onClick={onClick}
      dense={dense}
    >
      {buttonLabel}
    </Button>
  );
};

export default SubmitButton;
