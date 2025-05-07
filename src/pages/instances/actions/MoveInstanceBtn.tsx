import type { FC } from "react";
import { ActionButton, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useInstanceLoading } from "context/instanceLoading";
import MoveInstanceModal from "../MoveInstanceModal";
import classNames from "classnames";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  project: string;
  classname?: string;
  onClose?: () => void;
}

const MoveInstanceBtn: FC<Props> = ({ instance, classname }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditInstance } = useInstanceEntitlements();
  const instanceLoading = useInstanceLoading();
  const isLoading =
    instanceLoading.getType(instance) === "Moving" ||
    instance.status === "Moving";

  const isDisabled = isLoading || !!instanceLoading.getType(instance);

  return (
    <>
      {isOpen && (
        <Portal>
          <MoveInstanceModal close={closePortal} instance={instance} />
        </Portal>
      )}
      <ActionButton
        onClick={openPortal}
        type="button"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        loading={isLoading}
        disabled={isDisabled || !canEditInstance(instance)}
        title={
          canEditInstance()
            ? "Migrate instance"
            : "You do not have permission to move this instance"
        }
      >
        <Icon name="machines" />
        <span>Migrate</span>
      </ActionButton>
    </>
  );
};

export default MoveInstanceBtn;
