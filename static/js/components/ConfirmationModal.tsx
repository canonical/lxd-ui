import React, { FC, MouseEvent } from "react";
import { Button, Modal } from "@canonical/react-components";

interface Props {
  title: string;
  onClose: () => void;
  confirmationMessage: string;
  negButtonLabel?: string;
  posButtonLabel: string;
  onConfirm: (e: MouseEvent<HTMLElement>) => void;
  hasShiftHint?: boolean;
}

const ConfirmationModal: FC<Props> = ({
  title,
  onClose,
  confirmationMessage,
  negButtonLabel = "Cancel",
  posButtonLabel,
  onConfirm,
  hasShiftHint = true,
}) => {
  return (
    <Modal
      close={onClose}
      title={title}
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
    >
      <p style={{ textAlign: "start", whiteSpace: "pre-line" }}>
        {confirmationMessage}
      </p>
      {hasShiftHint && (
        <p className="u-text--muted">
          You can skip these confirmation modals by holding <code>SHIFT</code>{" "}
          when clicking on the action.
        </p>
      )}
    </Modal>
  );
};

export default ConfirmationModal;
