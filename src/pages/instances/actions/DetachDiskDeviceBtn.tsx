import type { FC } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";

interface Props {
  onDetach: () => void;
  disabledReason?: string;
}

const DetachDiskDeviceBtn: FC<Props> = ({ onDetach, disabledReason }) => {
  return (
    <ConfirmationButton
      appearance="base"
      type="button"
      title={disabledReason ?? "Detach disk"}
      className="has-icon u-no-margin--bottom is-dense"
      confirmationModalProps={{
        title: "Confirm disk detachment",
        children: (
          <p>
            Are you sure you want to clear this disk attachment?
            <br />
            This action may result in data loss if the disk is still mounted.
          </p>
        ),
        confirmButtonLabel: "Detach",
        onConfirm: onDetach,
      }}
      shiftClickEnabled
      showShiftClickHint
      disabled={!!disabledReason}
    >
      <Icon name="disconnect" />
      <span>Detach</span>
    </ConfirmationButton>
  );
};

export default DetachDiskDeviceBtn;
