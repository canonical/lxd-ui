import React, { FC, MouseEvent, ReactNode } from "react";
import { Button, Icon, ICONS, ValueOf } from "@canonical/react-components";
import usePortal from "react-useportal";
import ConfirmationModal from "./ConfirmationModal";
import classnames from "classnames";

interface Props {
  className?: string;
  isLoading?: boolean;
  icon?: ValueOf<typeof ICONS> | string;
  title: string;
  toggleAppearance?: string;
  toggleCaption?: string;
  confirmationExtra?: ReactNode;
  confirmationMessage: string;
  posButtonLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
  isDense?: boolean;
  isDisabled?: boolean;
}

const ConfirmationButton: FC<Props> = ({
  className,
  isLoading = false,
  icon = null,
  title,
  toggleAppearance = "",
  toggleCaption,
  confirmationExtra,
  confirmationMessage,
  posButtonLabel,
  onCancel,
  onConfirm,
  isDense = true,
  isDisabled = false,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleCancelModal = () => {
    closePortal();
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirmModal = () => {
    closePortal();
    onConfirm();
  };

  const handleShiftClick = (e: MouseEvent<HTMLElement>) => {
    if (e.shiftKey) {
      onConfirm();
    } else {
      openPortal(e);
    }
  };

  const iconName = icon ? (isLoading ? "spinner" : icon) : undefined;

  return (
    <>
      {isOpen && (
        <Portal>
          <ConfirmationModal
            title={title}
            onClose={handleCancelModal}
            confirmationExtra={confirmationExtra}
            confirmationMessage={confirmationMessage}
            posButtonLabel={posButtonLabel}
            onConfirm={handleConfirmModal}
          />
        </Portal>
      )}
      <Button
        appearance={toggleAppearance}
        hasIcon={!!iconName}
        className={className}
        dense={isDense}
        disabled={isDisabled}
        onClick={handleShiftClick}
        aria-label={posButtonLabel}
        title={posButtonLabel}
        type="button"
      >
        {iconName && (
          <Icon
            className={classnames({ "u-animation--spin": isLoading })}
            name={iconName}
          />
        )}
        {toggleCaption && <span>{toggleCaption}</span>}
      </Button>
    </>
  );
};

export default ConfirmationButton;
