import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
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
import AttachIsoBtn from "pages/instances/actions/AttachIsoBtn";
import NotificationRow from "components/NotificationRow";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { isInstanceRunning } from "util/instanceStatus";
import InstanceConsoleShortcuts from "pages/instances/InstanceConsoleShortcuts";

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

  const isRunning = isInstanceRunning(instance);

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
              onChange={() => {
                setGraphicConsole(true);
              }}
            />
            <RadioInput
              label="Text console"
              checked={!isGraphic}
              onChange={() => {
                setGraphicConsole(false);
              }}
            />
          </div>
          {isGraphic && isRunning && (
            <div>
              {hasCustomVolumeIso && <AttachIsoBtn instance={instance} />}
              <Button
                className="u-no-margin--bottom"
                onClick={() => {
                  handleFullScreen();
                }}
              >
                <span>Fullscreen</span>
              </Button>
              <InstanceConsoleShortcuts />
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
            aria-disabled={isLoading}
            onClick={handleStart}
            disabled={!canUpdateInstanceState(instance) || isLoading}
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
