import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { Tooltip } from "@canonical/react-components";
import { freezeInstance } from "api/instances";
import { useNotify } from "context/notify";

interface Props {
  instance: LxdInstance;
  hasCaption?: boolean;
  isDense?: boolean;
}

const PauseInstanceBtn: FC<Props> = ({
  instance,
  hasCaption = true,
  isDense = true,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(instance.status === "Freezing");
  const queryClient = useQueryClient();

  const handlePause = () => {
    setLoading(true);
    freezeInstance(instance)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} paused.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance pause.", e);
      });
  };

  const isDisabled = isLoading || instance.status !== "Running";

  return (
    <Tooltip
      message={
        isDisabled && !isLoading ? "Instance must be running" : undefined
      }
      position="btm-center"
    >
      <ConfirmationButton
        className="u-no-margin--bottom u-no-margin--right"
        isLoading={isLoading}
        iconDescription="Pause"
        title="Confirm pause"
        toggleCaption={
          hasCaption ? (isLoading ? "Pausing" : "Pause") : undefined
        }
        confirmationMessage={`Are you sure you want to pause instance "${instance.name}"?`}
        posButtonLabel="Pause"
        onConfirm={handlePause}
        isDense={isDense}
        isDisabled={isDisabled}
      />
    </Tooltip>
  );
};

export default PauseInstanceBtn;
