import React, { FC, MouseEvent, ReactNode } from "react";
import { Button, Modal, ValueOf } from "@canonical/react-components";
import { ButtonAppearance } from "@canonical/react-components/dist/components/Button/Button";

interface Props {
  confirmButtonAppearance?: ValueOf<typeof ButtonAppearance> | string;
  confirmButtonLabel: string;
  confirmExtra?: ReactNode;
  confirmMessage: string | ReactNode;
  hasShiftHint?: boolean;
  onClose: () => void;
  onConfirm: (e: MouseEvent<HTMLElement>) => void;
  title: string;
}

const ConfirmationModal: FC<Props> = ({
  confirmButtonAppearance = "negative",
  confirmButtonLabel,
  confirmExtra,
  confirmMessage,
  hasShiftHint = true,
  onClose,
  onConfirm,
  title,
}) => {
  return (
    <Modal
      close={onClose}
      title={title}
      buttonRow={
        <>
          {confirmExtra}
          <Button className="u-no-margin--bottom" onClick={onClose}>
            Cancel
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
        {confirmMessage}
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
