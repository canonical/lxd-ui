import React, { FC, useState } from "react";
import { Button, RadioInput } from "@canonical/react-components";
import { Notification } from "types/notification";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import { LxdInstance } from "types/instance";
import InstanceTextConsole from "./InstanceTextConsole";
import { failure, info } from "context/notify";
import EmptyState from "components/EmptyState";
import SubmitButton from "components/SubmitButton";
import { useInstanceStart } from "util/instanceStart";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);
  const isVm = instance.type === "virtual-machine";
  const [isGraphic, setGraphic] = useState(isVm);

  const isRunning = instance.status === "Running";

  const onFailure = (title: string, e: unknown, message?: string) => {
    setInTabNotification(failure(title, e, message));
  };

  const showNotRunningInfo = () => {
    setInTabNotification(
      info(
        "Start the instance to interact with the text console.",
        "Instance not running"
      )
    );
  };

  let handleFullScreen = () => {
    /**/
  };

  const onChildMount = (childHandleFullScreen: () => void) => {
    handleFullScreen = childHandleFullScreen;
  };

  const setGraphicConsole = (isGraphic: boolean) => {
    setInTabNotification(null);
    setGraphic(isGraphic);
  };

  const { handleStart, isLoading } = useInstanceStart(instance);

  return (
    <div className="instance-console-tab">
      {isVm && (
        <div className="p-panel__controls">
          <div className="console-radio-wrapper">
            <RadioInput
              labelClassName="right-margin"
              label="Graphic"
              checked={isGraphic}
              onChange={() => setGraphicConsole(true)}
            />
            <RadioInput
              label="Text console"
              checked={!isGraphic}
              onChange={() => setGraphicConsole(false)}
            />
          </div>
          {isGraphic && isRunning && (
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
      {isGraphic && !isRunning && (
        <EmptyState
          iconName="containers"
          iconClass="empty-instances-icon"
          title="Instance stopped"
          message="Start the instance to access the graphic console."
        >
          <SubmitButton
            isSubmitting={isLoading}
            isDisabled={false}
            buttonLabel="Start instance"
            onClick={handleStart}
          />
        </EmptyState>
      )}
      {isGraphic && isRunning && (
        <div className="spice-wrapper">
          <InstanceGraphicConsole
            instance={instance}
            onMount={onChildMount}
            onFailure={onFailure}
            inTabNotification={inTabNotification}
            clearNotification={() => setInTabNotification(null)}
          />
        </div>
      )}
      {!isGraphic && (
        <InstanceTextConsole
          instance={instance}
          onFailure={onFailure}
          showNotRunningInfo={showNotRunningInfo}
          clearNotification={() => setInTabNotification(null)}
        />
      )}
    </div>
  );
};

export default InstanceConsole;
