import React, { FC, useState } from "react";
import { LxdInstance } from "../../types/instance";
import { NotificationHelper } from "../../types/notification";
import { ContextualMenu } from "@canonical/react-components";
import StartInstanceBtn from "./StartInstanceBtn";
import StopInstanceBtn from "./StopInstanceBtn";
import OpenSnapshotsBtn from "./OpenSnapshotsBtn";
import OpenTerminalBtn from "./OpenTerminalBtn";
import OpenVgaBtn from "./OpenVgaBtn";
import EditInstanceBtn from "./EditInstanceBtn";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
}

const InstanceActionsBtn: FC<Props> = ({ instance, notify }) => {
  const [isOpen, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <ContextualMenu
      hasToggleIcon
      onClick={() => setOpen(true)}
      position="right"
      toggleAppearance="base"
      toggleLabel="Actions"
      visible={isOpen}
    >
      <StartInstanceBtn instance={instance} notify={notify} onFinish={close} />
      <StopInstanceBtn instance={instance} notify={notify} onFinish={close} />
      <EditInstanceBtn instance={instance} />
      <OpenSnapshotsBtn instance={instance} />
      <OpenTerminalBtn instance={instance} />
      <OpenVgaBtn instance={instance} />
    </ContextualMenu>
  );
};

export default InstanceActionsBtn;
