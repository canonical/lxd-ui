import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { NotificationHelper } from "types/notification";
import ConfirmationButton from "components/ConfirmationButton";
import { Tooltip } from "@canonical/react-components";
import { freezeInstance, unfreezeInstance } from "api/instances";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  hasCaption?: boolean;
  isDense?: boolean;
}

const FreezeInstanceBtn: FC<Props> = ({
  instance,
  notify,
  hasCaption = true,
  isDense = true,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleFreeze = () => {
    setLoading(true);
    freezeInstance(instance)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} frozen.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance freeze.", e);
      });
  };

  const handleUnfreeze = () => {
    setLoading(true);
    unfreezeInstance(instance)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} is now running.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance unfreeze.", e);
      });
  };

  const isDisabled =
    isLoading || instance.status === "Stopped" || instance.status === "Error";

  return (
    <Tooltip
      message={
        isDisabled && !isLoading ? "Instance must be running" : undefined
      }
      position="btm-center"
    >
      {instance.status !== "Frozen" ? (
        <ConfirmationButton
          className="u-no-margin--bottom u-no-margin--right"
          isLoading={isLoading}
          iconClass={
            isLoading
              ? "p-icon--spinner u-animation--spin"
              : "p-icon--disconnect"
          }
          iconDescription="Freeze"
          title="Confirm freeze"
          toggleCaption={hasCaption ? "Freeze" : undefined}
          confirmationMessage={`Are you sure you want to freeze instance "${instance.name}"?`}
          posButtonLabel="Freeze"
          onConfirm={handleFreeze}
          isDense={isDense}
          isDisabled={isDisabled}
        />
      ) : (
        <ConfirmationButton
          className="u-no-margin--bottom u-no-margin--right"
          isLoading={isLoading}
          iconClass={
            isLoading
              ? "p-icon--spinner u-animation--spin"
              : "p-icon--connected"
          }
          iconDescription="Unfreeze"
          title="Confirm unfreeze"
          toggleCaption={hasCaption ? "Unfreeze" : undefined}
          confirmationMessage={`Are you sure you want to unfreeze instance "${instance.name}"?`}
          posButtonLabel="Unfreeze"
          onConfirm={handleUnfreeze}
          isDense={isDense}
          isDisabled={isDisabled}
        />
      )}
    </Tooltip>
  );
};

export default FreezeInstanceBtn;
