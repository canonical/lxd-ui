import React, { FC, useState } from "react";
import { Button, RadioInput } from "@canonical/react-components";
import { Notification } from "types/notification";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import { LxdInstance } from "types/instance";
import InstanceTextConsole from "./InstanceTextConsole";
import { failure } from "context/notify";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);
  const isVm = instance.type === "virtual-machine";
  const [isGraphic, setGraphic] = useState(isVm);

  const onFailure = (title: string, e: unknown, message?: string) => {
    setInTabNotification(failure(title, e, message));
  };

  let handleFullScreen = () => {
    /**/
  };

  const onChildMount = (childHandleFullScreen: () => void) => {
    handleFullScreen = childHandleFullScreen;
  };

  return (
    <div className="instance-console-tab">
      {isVm && (
        <div className="p-panel__controls">
          <div className="console-radio-wrapper">
            <RadioInput
              labelClassName="right-margin"
              label="Graphic"
              checked={isGraphic}
              onChange={() => setGraphic(true)}
            />
            <RadioInput
              label="Text console"
              checked={!isGraphic}
              onChange={() => setGraphic(false)}
            />
          </div>
          {isGraphic && (
            <Button
              className="u-no-margin--bottom"
              onClick={() => handleFullScreen()}
            >
              <span>Fullscreen</span>
            </Button>
          )}
        </div>
      )}
      <NotificationRowLegacy
        notification={inTabNotification}
        onDismiss={() => setInTabNotification(null)}
      />
      {isGraphic ? (
        <div className="spice-wrapper">
          <InstanceGraphicConsole
            instance={instance}
            onMount={onChildMount}
            onFailure={onFailure}
            inTabNotification={inTabNotification}
            clearNotification={() => setInTabNotification(null)}
          />
        </div>
      ) : (
        <InstanceTextConsole
          instance={instance}
          onFailure={onFailure}
          clearNotification={() => setInTabNotification(null)}
        />
      )}
    </div>
  );
};

export default InstanceConsole;
