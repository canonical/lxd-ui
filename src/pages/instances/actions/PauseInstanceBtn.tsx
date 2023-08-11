import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { freezeInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import ItemName from "components/ItemName";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const PauseInstanceBtn: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Pausing" ||
    instance.status === "Freezing";

  const handlePause = () => {
    instanceLoading.setLoading(instance, "Pausing");
    freezeInstance(instance)
      .then(() => {
        notify.success(
          <>
            Instance <InstanceLink instance={instance} /> paused.
          </>
        );
      })
      .catch((e) => {
        notify.failure(
          "Instance pause failed",
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

  const isDisabled = isLoading || instance.status !== "Running";

  return (
    <ConfirmationButton
      appearance="base"
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm pause",
        children: (
          <>
            This will pause instance <ItemName item={instance} bold />.
          </>
        ),
        onConfirm: handlePause,
        confirmButtonLabel: "Pause",
      }}
      className="has-icon is-dense"
      disabled={isDisabled}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="pause" />
    </ConfirmationButton>
  );
};

export default PauseInstanceBtn;
