import { useState, type FC } from "react";
import { Button } from "@canonical/react-components";
import type { TerminalConnectPayload } from "types/terminal";
import TerminalPayloadForm from "../TerminalPayloadForm";
import type { LxdInstance } from "types/instance";
import DsIcon from "components/DsIcon";

interface Props {
  payload: TerminalConnectPayload;
  reconnect: (data: TerminalConnectPayload) => void;
  instance: LxdInstance;
}

const ReconnectTerminalBtn: FC<Props> = ({ payload, reconnect, instance }) => {
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
          instance={instance}
          payload={payload}
        />
      )}
      <Button className="u-no-margin--bottom" hasIcon onClick={openModal}>
        <DsIcon icon="connected" />
        <span>Reconnect</span>
      </Button>
    </>
  );
};

export default ReconnectTerminalBtn;
