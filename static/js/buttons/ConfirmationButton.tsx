import React, { FC, useState } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";

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

  const handleModifierClick = (
    e: any,
    modifier: string,
    onModifierClick: Function,
    onClick: Function
  ) => {
    if (e[modifier]) onModifierClick();
    else onClick();
  };

  const handleShiftClick = (
    e: any,
    onShiftClick: Function,
    onClick: Function
  ) => {
    handleModifierClick(e, "shiftKey", onShiftClick, onClick);
  };

  return (
    <>
      <button
        onClick={(e) =>
          handleShiftClick(e, onPositiveCloseModal, () => setOpen(true))
        }
        className="is-dense fix-button-with-modal"
      >
        <i
          className={
            isLoading ? "p-icon--spinner u-animation--spin" : iconClass
          }
        >
          Delete
        </i>
      </button>
      {isOpen && (
        <ConfirmationModal
          title={title}
          onClose={() => setOpen(false)}
          confirmationMessage={confirmationMessage}
          posButtonLabel={posButtonLabel}
          onPositive={onPositiveCloseModal}
        />
      )}
    </>
  );
};

export default ConfirmationButton;
