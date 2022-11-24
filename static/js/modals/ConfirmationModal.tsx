import React, { FC } from "react";
import { Button, Modal } from "@canonical/react-components";

type Props = {
  title: string;
  onClose: () => void;
  confirmationMessage: string;
  negButtonLabel?: string;
  posButtonLabel: string;
  onPositive: () => void;
};

const ConfirmationModal: FC<Props> = ({
  title,
  onClose,
  confirmationMessage,
  negButtonLabel = "Cancel",
  posButtonLabel,
  onPositive,
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
          <Button appearance="positive" onClick={onPositive}>
            {posButtonLabel}
          </Button>
        </>
      }
    >
      <p style={{ textAlign: "start", whiteSpace: "pre-line" }}>
        {confirmationMessage}
      </p>
    </Modal>
  );
};

export default ConfirmationModal;
