import React, { FC, MouseEvent, ReactNode } from "react";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import ConfirmationModal from "./ConfirmationModal";

interface Props {
  className?: string;
  isLoading?: boolean;
  iconClass?: string;
  iconDescription?: string;
  title: string;
  toggleAppearance?: string;
  toggleCaption?: string;
  confirmationExtra?: ReactNode;
  confirmationMessage: string;
  posButtonLabel: string;
  onConfirm: () => void;
  isDense?: boolean;
  isDisabled?: boolean;
}

const ConfirmationButton: FC<Props> = ({
  className,
  isLoading = false,
  iconClass = null,
  iconDescription = null,
  title,
  toggleAppearance = "",
  toggleCaption,
  confirmationExtra,
  confirmationMessage,
  posButtonLabel,
  onConfirm,
  isDense = true,
  isDisabled = false,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

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

  const visibleIcon = iconClass
    ? isLoading
      ? "p-icon--spinner u-animation--spin"
      : iconClass
    : undefined;

  return (
    <>
      {isOpen && (
        <Portal>
          <ConfirmationModal
            title={title}
            onClose={closePortal}
            confirmationExtra={confirmationExtra}
            confirmationMessage={confirmationMessage}
            posButtonLabel={posButtonLabel}
            onConfirm={handleConfirmModal}
          />
        </Portal>
      )}
      <Button
        appearance={toggleAppearance}
        hasIcon={!!visibleIcon}
        className={className}
        dense={isDense}
        disabled={isDisabled}
        onClick={handleShiftClick}
        type="button"
      >
        {visibleIcon && <i className={visibleIcon}>{iconDescription}</i>}
        {toggleCaption && <span>{toggleCaption}</span>}
      </Button>
    </>
  );
};

export default ConfirmationButton;
