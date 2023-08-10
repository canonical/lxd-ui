import React, { FC, useState } from "react";
import {
  Button,
  ContextualMenu,
  EmptyState,
  Icon,
  NotificationType,
  RadioInput,
  failure,
  info,
} from "@canonical/react-components";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import { LxdInstance } from "types/instance";
import InstanceTextConsole from "./InstanceTextConsole";
import SubmitButton from "components/SubmitButton";
import { useInstanceStart } from "util/instanceStart";
import {
  sendAltF4,
  sendAltTab,
  sendCtrlAltDel,
} from "../../lib/spice/src/inputs";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const [inTabNotification, setInTabNotification] =
    useState<NotificationType | null>(null);
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
            <div>
              <Button
                className="u-no-margin--bottom"
                onClick={() => handleFullScreen()}
              >
                <span>Fullscreen</span>
              </Button>
              <ContextualMenu
                hasToggleIcon
                toggleLabel="Shortcuts"
                toggleClassName="u-no-margin--bottom"
                links={[
                  {
                    children: "Send Ctrl + Alt + Del",
                    onClick: () => sendCtrlAltDel(window.spice_connection),
                  },
                  {
                    children: "Send Alt + TAB",
                    onClick: () => sendAltTab(window.spice_connection),
                  },
                  {
                    children: "Send Alt + F4",
                    onClick: () => sendAltF4(window.spice_connection),
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
      <NotificationRowLegacy
        notification={inTabNotification}
        onDismiss={() => setInTabNotification(null)}
      />
      {isGraphic && !isRunning && (
        <EmptyState
          className="empty-state"
          image={<Icon name="containers" className="empty-state-icon" />}
          title="Instance stopped"
        >
          <p>Start the instance to access the graphic console.</p>
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
