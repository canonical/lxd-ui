import React, { FC, KeyboardEvent } from "react";
import { Button, Modal } from "@canonical/react-components";

interface Props {
  title: string;
  onClose: () => void;
  confirmationMessage: string;
  negButtonLabel?: string;
  posButtonLabel: string;
  onConfirm: () => void;
}

const ConfirmationModal: FC<Props> = ({
  title,
  onClose,
  confirmationMessage,
  negButtonLabel = "Cancel",
  posButtonLabel,
  onConfirm,
}) => {
  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <Modal
      close={onClose}
      title={title}
      className="modal-above-navigation"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={onClose}>
            {negButtonLabel}
          </Button>
          <Button
            appearance="negative"
            className="u-no-margin--bottom"
            onClick={onConfirm}
          >
            {posButtonLabel}
          </Button>
        </>
      }
      onKeyDown={handleEscKey}
    >
      <p style={{ textAlign: "start", whiteSpace: "pre-line" }}>
        {confirmationMessage}
      </p>
    </Modal>
  );
};

export default ConfirmationModal;
