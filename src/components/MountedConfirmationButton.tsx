import type {
  ActionButtonProps,
  ConfirmationModalProps,
  PropsWithSpread,
  SubComponentProps,
} from "@canonical/react-components";
import { ActionButton, ConfirmationModal } from "@canonical/react-components";
import type { MouseEvent, ReactNode } from "react";
import { useModal } from "context/useModal";

const generateTitle = (title: ReactNode) => {
  if (typeof title === "string") {
    return title;
  }
  if (typeof title === "number") {
    return title.toString();
  }
  return null;
};

export type Props = PropsWithSpread<
  {
    /**
     * Additional props to pass to the confirmation modal.
     */
    confirmationModalProps: SubComponentProps<ConfirmationModalProps> & {
      onConfirm: (event: MouseEvent) => void;
    };
    /**
     * An optional text to be shown when hovering over the button.<br/>
     * Defaults to the label of the confirm button in the modal.
     */
    onHoverText?: string;
    /**
     * Whether to enable the SHIFT+Click shortcut to skip the confirmation modal and perform the action.
     */
    shiftClickEnabled?: boolean;
    /**
     * Whether to show a hint about the SHIFT+Click shortcut to skip the confirmation modal.
     */
    showShiftClickHint?: boolean;
    /**
     * A handler that determines whether the confirmation modal should be shown.
     * If it returns `true`, the modal is shown. If it returns `false`, the modal is not shown.
     */
    preModalOpenHook?: (event: MouseEvent) => boolean;
  },
  ActionButtonProps
>;

/**
 * `ConfirmationButton` is a specialised version of the [ActionButton](?path=/docs/actionbutton--default-story) component that uses a [ConfirmationModal](?path=/docs/confirmationmodal--default-story) to prompt a confirmation from the user before executing an action.
 */
export const MountedConfirmationButton = ({
  confirmationModalProps,
  onHoverText,
  shiftClickEnabled = false,
  showShiftClickHint = false,
  preModalOpenHook,
  ...actionButtonProps
}: Props): React.JSX.Element => {
  const { showModal, hideModal } = useModal();

  const openModal = () => {
    showModal(
      <ConfirmationModal
        {...confirmationModalProps}
        close={handleCancelModal}
        confirmButtonLabel={confirmationModalProps.confirmButtonLabel}
        onConfirm={handleConfirmModal}
      >
        {confirmationModalProps.children}
        {showShiftClickHint && (
          <p className="p-text--small u-text--muted u-hide--small">
            Next time, you can skip this confirmation by holding{" "}
            <code>SHIFT</code> and clicking the action.
          </p>
        )}
      </ConfirmationModal>,
    );
  };

  const handleCancelModal = () => {
    hideModal();
    if (confirmationModalProps.close) {
      confirmationModalProps.close();
    }
  };

  const handleConfirmModal = (e: MouseEvent) => {
    hideModal();
    confirmationModalProps.onConfirm(e);
  };

  const handleShiftClick = (e: MouseEvent) => {
    if (e.shiftKey) {
      confirmationModalProps.onConfirm(e);
    } else {
      openModal();
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (preModalOpenHook) {
      const result = preModalOpenHook(e);

      if (!result) return;
    }

    if (shiftClickEnabled) {
      handleShiftClick(e);
    } else {
      openModal();
    }
  };

  return (
    <>
      <ActionButton
        {...actionButtonProps}
        onClick={handleClick}
        title={
          generateTitle(
            onHoverText ?? confirmationModalProps.confirmButtonLabel,
          ) ?? ""
        }
      >
        {actionButtonProps.children}
      </ActionButton>
    </>
  );
};

export default MountedConfirmationButton;
