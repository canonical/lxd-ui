import React, { FC, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { TerminalConnectPayload } from "types/terminal";
import TerminalPayloadForm from "../TerminalPayloadForm";

interface Props {
  payload: TerminalConnectPayload;
  reconnect: (data: TerminalConnectPayload) => void;
}

const ReconnectTerminalBtn: FC<Props> = ({ payload, reconnect }) => {
  const [isModal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

  const handleReconnect = (payload: TerminalConnectPayload) => {
    closeModal();
    reconnect(payload);
  };

  return (
    <>
      {isModal && (
        <TerminalPayloadForm
          close={closeModal}
          reconnect={handleReconnect}
          payload={payload}
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
