import React, { FC, useState } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Button } from "@canonical/react-components";

interface Props {
  isLoading: boolean;
  iconClass: string;
  title: string;
  confirmationMessage: string;
  posButtonLabel: string;
  onConfirm: () => void;
  isDisabled?: boolean;
}

const ConfirmationButton: FC<Props> = ({
  isLoading,
  iconClass,
  title,
  confirmationMessage,
  posButtonLabel,
  onConfirm,
  isDisabled = false,
}) => {
  const [isOpen, setOpen] = useState(false);

  const handleConfirmModal = () => {
    setOpen(false);
    onConfirm();
  };

  const handleShiftClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.shiftKey) {
      onConfirm();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {isOpen && (
        <ConfirmationModal
          title={title}
          onClose={() => setOpen(false)}
          confirmationMessage={confirmationMessage}
          posButtonLabel={posButtonLabel}
          onConfirm={handleConfirmModal}
        />
      )}
      <Button dense disabled={isDisabled} onClick={handleShiftClick}>
        <i
          className={
            isLoading ? "p-icon--spinner u-animation--spin" : iconClass
          }
        >
          Delete
        </i>
      </Button>
    </>
  );
};

export default ConfirmationButton;
