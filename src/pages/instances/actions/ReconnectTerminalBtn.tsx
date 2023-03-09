import React, { FC, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { LxdTerminalPayload } from "types/terminal";
import TerminalPayloadForm from "../TerminalPayloadForm";

interface Props {
  onFinish: (data: LxdTerminalPayload) => void;
}

const ReconnectTerminalBtn: FC<Props> = ({ onFinish }) => {
  const [isModal, setModal] = useState(false);

  const confirmModal = (result: LxdTerminalPayload) => {
    onFinish(result);
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

  return (
    <>
      {isModal && (
        <TerminalPayloadForm
          close={() => setModal(false)}
          onFinish={confirmModal}
        />
      )}
      <Button className="u-no-margin--bottom" hasIcon onClick={openModal}>
        <Icon name="connected" />
        <span>Reconnect</span>
      </Button>
    </>
  );
};

export default ReconnectTerminalBtn;
