import { FC, useState } from "react";
import {
  ActionButton,
  Button,
  ContextualMenu,
  EmptyState,
  Icon,
  Notification,
  RadioInput,
  useNotify,
} from "@canonical/react-components";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import type { LxdInstance } from "types/instance";
import InstanceTextConsole from "./InstanceTextConsole";
import { useInstanceStart } from "util/instanceStart";
import { sendAltF4, sendAltTab, sendCtrlAltDel } from "lib/spice/src/inputs.js";
import AttachIsoBtn from "pages/instances/actions/AttachIsoBtn";
import NotificationRow from "components/NotificationRow";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const isVm = instance.type === "virtual-machine";
  const [isGraphic, setGraphic] = useState(isVm);
  const { hasCustomVolumeIso } = useSupportedFeatures();
  const { canUpdateInstanceState, canAccessInstanceConsole } =
    useInstanceEntitlements();

  const isRunning = instance.status === "Running";

  const onFailure = (title: string, e: unknown, message?: string) => {
    notify.failure(title, e, message);
  };

  const showNotRunningInfo = () => {
    notify.info(
      "Start the instance to interact with the text console.",
      "Instance not running",
    );
  };

  let handleFullScreen = () => {
    /**/
  };

  const onChildMount = (childHandleFullScreen: () => void) => {
    handleFullScreen = childHandleFullScreen;
  };

  const setGraphicConsole = (isGraphic: boolean) => {
    notify.clear();
    setGraphic(isGraphic);
  };

  const { handleStart, isLoading } = useInstanceStart(instance);

  if (!canAccessInstanceConsole(instance)) {
    return (
      <Notification severity="caution" title="Restricted permissions">
        You do not have permission to access the console for this instance.
      </Notification>
    );
  }

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
              {hasCustomVolumeIso && <AttachIsoBtn instance={instance} />}
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
      <NotificationRow />
      {isGraphic && !isRunning && (
        <EmptyState
          className="empty-state"
          image={<Icon name="pods" className="empty-state-icon" />}
          title="Instance stopped"
        >
          <p>Start the instance to access the graphic console.</p>
          <ActionButton
            appearance="positive"
            loading={isLoading}
            onClick={handleStart}
            disabled={!canUpdateInstanceState(instance)}
            title={
              canUpdateInstanceState(instance)
                ? ""
                : "You do not have permission to start this instance."
            }
          >
            Start instance
          </ActionButton>
        </EmptyState>
      )}
      {isGraphic && isRunning && (
        <div className="spice-wrapper">
          <InstanceGraphicConsole
            instance={instance}
            onMount={onChildMount}
            onFailure={onFailure}
          />
        </div>
      )}
      {!isGraphic && (
        <InstanceTextConsole
          instance={instance}
          onFailure={onFailure}
          showNotRunningInfo={showNotRunningInfo}
        />
      )}
    </div>
  );
};

export default InstanceConsole;
