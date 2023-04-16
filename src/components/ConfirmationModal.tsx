import React, { FC, MouseEvent, ReactNode } from "react";
import { Button, Modal } from "@canonical/react-components";

interface Props {
  title: string;
  onClose: () => void;
  confirmationExtra?: ReactNode;
  confirmationMessage: string | ReactNode;
  cancelButtonLabel?: string;
  confirmButtonLabel: string;
  confirmButtonAppearance?: string;
  onConfirm: (e: MouseEvent<HTMLElement>) => void;
  hasShiftHint?: boolean;
}

const ConfirmationModal: FC<Props> = ({
  title,
  onClose,
  confirmationExtra,
  confirmationMessage,
  cancelButtonLabel = "Cancel",
  confirmButtonLabel,
  confirmButtonAppearance = "negative",
  onConfirm,
  hasShiftHint = true,
}) => {
  return (
    <Modal
      close={onClose}
      title={title}
      buttonRow={
        <>
          {confirmationExtra}
          <Button className="u-no-margin--bottom" onClick={onClose}>
            {cancelButtonLabel}
          </Button>
          <Button
            appearance={confirmButtonAppearance}
            className="u-no-margin--bottom"
            onClick={onConfirm}
          >
            {confirmButtonLabel}
          </Button>
        </>
      }
    >
      <p style={{ textAlign: "start", whiteSpace: "pre-line" }}>
        {confirmationMessage}
      </p>
      {hasShiftHint && (
        <p className="u-text--muted u-hide--small">
          You can skip these confirmation modals by holding <code>SHIFT</code>{" "}
          when clicking on the action.
        </p>
      )}
    </Modal>
  );
};

export default ConfirmationModal;
