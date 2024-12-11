import { FC } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";

interface Props {
  onDetach: () => void;
}

const DetachDiskDeviceBtn: FC<Props> = ({ onDetach }) => {
  return (
    <ConfirmationButton
      appearance="base"
      type="button"
      title="Detach disk devicve"
      className="has-icon u-no-margin--bottom is-dense"
      confirmationModalProps={{
        title: "Confirm disk device detach",
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
    >
      <Icon name="disconnect" />
      <span>Detach</span>
    </ConfirmationButton>
  );
};

export default DetachDiskDeviceBtn;
