import React, { FC, useState } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Button } from "@canonical/react-components";

type Props = {
  isLoading: boolean;
  iconClass: string;
  title: string;
  confirmationMessage: string;
  posButtonLabel: string;
  onPositive: () => void;
};

const ConfirmationButton: FC<Props> = ({
  isLoading,
  iconClass,
  title,
  confirmationMessage,
  posButtonLabel,
  onPositive,
}) => {
  const [isOpen, setOpen] = useState(false);

  const onPositiveCloseModal = () => {
    setOpen(false);
    onPositive();
  };

  const handleShiftClick = (e: any) => {
    if (e["shiftKey"]) {
      onPositive();
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
          onPositive={onPositiveCloseModal}
        />
      )}
      <Button dense onClick={handleShiftClick}>
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
