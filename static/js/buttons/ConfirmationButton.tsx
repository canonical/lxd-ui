import React, { FC, MouseEvent } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";

interface Props {
  className?: string;
  isLoading: boolean;
  iconClass: string;
  iconDescription: string;
  title: string;
  toggleAppearance?: string;
  toggleCaption?: string;
  confirmationMessage: string;
  posButtonLabel: string;
  onConfirm: () => void;
  isDense?: boolean;
  isDisabled?: boolean;
}

const ConfirmationButton: FC<Props> = ({
  className,
  isLoading,
  iconClass,
  iconDescription,
  title,
  toggleAppearance = "",
  toggleCaption,
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

  return (
    <>
      {isOpen && (
        <Portal>
          <ConfirmationModal
            title={title}
            onClose={closePortal}
            confirmationMessage={confirmationMessage}
            posButtonLabel={posButtonLabel}
            onConfirm={handleConfirmModal}
          />
        </Portal>
      )}
      <Button
        appearance={toggleAppearance}
        hasIcon={toggleCaption !== undefined}
        className={className}
        dense={isDense}
        disabled={isDisabled}
        onClick={handleShiftClick}
      >
        <i
          className={
            isLoading ? "p-icon--spinner u-animation--spin" : iconClass
          }
        >
          {iconDescription}
        </i>
        {toggleCaption && <span>{toggleCaption}</span>}
      </Button>
    </>
  );
};

export default ConfirmationButton;
