import React, { FC, useState } from "react";
import { Button, RadioInput } from "@canonical/react-components";
import { Notification } from "types/notification";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import { LxdInstance } from "types/instance";
import InstanceTextConsole from "./InstanceTextConsole";
import { failure, useNotify } from "context/notify";
import EmptyState from "components/EmptyState";
import { useQueryClient } from "@tanstack/react-query";
import { unfreezeInstance, startInstance } from "api/instances";
import ItemName from "components/ItemName";
import { useInstanceLoading } from "context/instanceLoading";
import { queryKeys } from "util/queryKeys";
import InstanceLink from "./InstanceLink";
import SubmitButton from "components/SubmitButton";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);
  const isVm = instance.type === "virtual-machine";
  const [isGraphic, setGraphic] = useState(isVm);
  const instanceLoading = useInstanceLoading();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Starting" ||
    instance.status === "Starting";

  const isRunning = instance.status === "Running";

  const onFailure = (title: string, e: unknown, message?: string) => {
    setInTabNotification(failure(title, e, message));
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

  const handleStart = () => {
    instanceLoading.setLoading(instance, "Starting");
    const mutation =
      instance.status === "Frozen" ? unfreezeInstance : startInstance;
    mutation(instance)
      .then(() => {
        notify.success(
          <>
            Instance <InstanceLink instance={instance} /> started.
          </>
        );
      })
      .catch((e) => {
        notify.failure(
          "Instance start failed",
          e,
          <>
            Instance <ItemName item={instance} bold />:
          </>
        );
      })
      .finally(() => {
        instanceLoading.setFinish(instance);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      });
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
          iconClass="p-empty-instances"
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
          clearNotification={() => setInTabNotification(null)}
        />
      )}
    </div>
  );
};

export default InstanceConsole;
