import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { NotificationHelper } from "types/notification";
import { useQueryClient } from "@tanstack/react-query";
import { startInstance, stopInstance, unfreezeInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { Button, CheckboxInput } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  className?: string;
  hasCaption?: boolean;
  isDense?: boolean;
  onStarting?: (instance: LxdInstance) => void;
  onStopping?: (instance: LxdInstance) => void;
  onFinish?: (instance: LxdInstance) => void;
}

const StartStopInstanceBtn: FC<Props> = ({
  instance,
  notify,
  className = "u-no-margin--bottom",
  hasCaption = true,
  isDense = true,
  onStarting,
  onStopping,
  onFinish,
}) => {
  const [isStarting, setStarting] = useState(false);
  const [isStopping, setStopping] = useState(false);
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();

  const setStart = (val: boolean) => {
    setStarting(val);
    if (val && onStarting) {
      onStarting(instance);
    }
    if (!val && onFinish) {
      onFinish(instance);
    }
  };

  const setStop = (val: boolean) => {
    setStopping(val);
    if (val && onStopping) {
      onStopping(instance);
    }
    if (!val && onFinish) {
      onFinish(instance);
    }
  };

  const canBeStarted =
    instance.status === "Stopped" || instance.status === "Frozen";
  const canBeStopped =
    instance.status.endsWith("ing") ||
    instance.status === "Ready" ||
    instance.status === "Frozen";
  const isDisabled = isStarting || isStopping;

  const handleStart = () => {
    setStart(true);
    const mutation =
      instance.status === "Frozen" ? unfreezeInstance : startInstance;
    mutation(instance)
      .then(() => {
        setStart(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} started.`);
      })
      .catch((e) => {
        setStart(false);
        notify.failure("Error on instance start.", e);
      });
  };

  const handleStop = () => {
    setStop(true);
    stopInstance(instance, isForce)
      .then(() => {
        setStop(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} stopped.`);
      })
      .catch((e) => {
        setStop(false);
        notify.failure("Error on instance stop.", e);
      });
  };

  return (
    <>
      {canBeStarted && (
        <Button
          hasIcon
          className={className}
          dense={isDense}
          disabled={isDisabled}
          onClick={handleStart}
          type="button"
        >
          <i
            className={
              isStarting
                ? "p-icon--spinner u-animation--spin"
                : "p-icon--video-play"
            }
          />
          <span>{isStarting ? "Starting" : "Start"}</span>
        </Button>
      )}
      {canBeStopped && (
        <ConfirmationButton
          className={className}
          isLoading={isStopping}
          iconClass={"p-icon--power-off"}
          iconDescription="Stop"
          title="Confirm stop"
          toggleCaption={
            hasCaption ? (isStopping ? "Stopping" : "Stop") : undefined
          }
          confirmationMessage={`Are you sure you want to stop instance "${instance.name}"?`}
          confirmationExtra={
            <span className="u-float-left">
              <CheckboxInput
                inline
                label="Force stop"
                tabIndex={-1}
                defaultChecked={isForce}
                onClick={() => setForce((prev) => !prev)}
              />
            </span>
          }
          posButtonLabel="Stop"
          onConfirm={handleStop}
          isDense={isDense}
        />
      )}
    </>
  );
};

export default StartStopInstanceBtn;
