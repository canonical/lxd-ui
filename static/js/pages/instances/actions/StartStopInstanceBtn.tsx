import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { NotificationHelper } from "types/notification";
import { useQueryClient } from "@tanstack/react-query";
import { startInstance, stopInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  className?: string;
  hasCaption?: boolean;
  isDense?: boolean;
}

const StartStopInstanceBtn: FC<Props> = ({
  instance,
  notify,
  className = "u-no-margin--bottom u-no-margin--right",
  hasCaption = true,
  isDense = true,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const canBeStarted = instance.status === "Stopped";
  const canBeStopped =
    instance.status === "Running" ||
    instance.status === "Ready" ||
    instance.status === "Frozen";
  const isEnabled = !isLoading;

  const handleStart = () => {
    setLoading(true);
    startInstance(instance.name)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} started.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance start.", e);
      });
  };

  const handleStop = () => {
    setLoading(true);
    stopInstance(instance.name)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} stopped.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance stop.", e);
      });
  };

  return (
    <>
      {canBeStarted && (
        <ConfirmationButton
          className={isLoading ? "" : className}
          isLoading={isLoading}
          iconClass={
            isLoading
              ? "p-icon--spinner u-animation--spin"
              : "p-icon--video-play"
          }
          iconDescription="Start"
          title="Confirm start"
          toggleCaption={hasCaption ? "Start" : undefined}
          confirmationMessage={`Are you sure you want to start instance "${instance.name}"?`}
          posButtonLabel="Start"
          onConfirm={handleStart}
          isDense={isDense}
          isDisabled={!isEnabled}
        />
      )}
      {canBeStopped && (
        <ConfirmationButton
          className={isLoading ? "" : className}
          isLoading={isLoading}
          iconClass={
            isLoading
              ? "p-icon--spinner u-animation--spin"
              : "p-icon--power-off"
          }
          iconDescription="Stop"
          title="Confirm stop"
          toggleCaption={hasCaption ? "Stop" : undefined}
          confirmationMessage={`Are you sure you want to stop instance "${instance.name}"?`}
          posButtonLabel="Stop"
          onConfirm={handleStop}
          isDense={isDense}
          isDisabled={!isEnabled}
        />
      )}
    </>
  );
};

export default StartStopInstanceBtn;
