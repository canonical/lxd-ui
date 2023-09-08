import React, { FC, MouseEvent, ReactNode } from "react";
import { Button, Icon, ICONS, ValueOf } from "@canonical/react-components";
import usePortal from "react-useportal";
import ConfirmationModal from "./ConfirmationModal";
import classnames from "classnames";
import { ButtonAppearance } from "@canonical/react-components/dist/components/Button/Button";

interface Props {
  cancelButtonLabel?: string;
  className?: string;
  confirmButtonAppearance?: ValueOf<typeof ButtonAppearance> | string;
  confirmButtonLabel: string;
  confirmExtra?: ReactNode;
  confirmMessage: string | ReactNode;
  hasShiftHint?: boolean;
  isDense?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  icon?: ValueOf<typeof ICONS> | string;
  onCancel?: () => void;
  onConfirm: () => void;
  onHoverText?: string;
  title: string;
  toggleAppearance?: ValueOf<typeof ButtonAppearance> | string;
  toggleCaption?: string;
}

const ConfirmationButton: FC<Props> = ({
  cancelButtonLabel,
  className,
  confirmButtonAppearance,
  confirmButtonLabel,
  confirmExtra,
  confirmMessage,
  hasShiftHint = true,
  icon = null,
  isDense = true,
  isDisabled = false,
  isLoading = false,
  onCancel,
  onConfirm,
  onHoverText,
  title,
  toggleAppearance = "",
  toggleCaption,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleCancelModal = () => {
    closePortal();
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirmModal = () => {
    closePortal();
    onConfirm();
  };

  const handleShiftClick = (e: MouseEvent<HTMLElement>) => {
    if (e.shiftKey) {
      onConfirm();
    } else {
      openPortal(e);
    }
  };

  const iconName = icon ? (isLoading ? "spinner" : icon) : undefined;

  return (
    <>
      {isOpen && (
        <Portal>
          <ConfirmationModal
            title={title}
            onClose={handleCancelModal}
            cancelButtonLabel={cancelButtonLabel}
            confirmExtra={confirmExtra}
            confirmMessage={confirmMessage}
            confirmButtonLabel={confirmButtonLabel}
            confirmButtonAppearance={confirmButtonAppearance}
            onConfirm={handleConfirmModal}
            hasShiftHint={hasShiftHint}
          />
        </Portal>
      )}
      <Button
        appearance={toggleAppearance}
        hasIcon={!!iconName}
        className={className}
        dense={isDense}
        disabled={isDisabled}
        onClick={handleShiftClick}
        aria-label={confirmButtonLabel}
        title={onHoverText ?? confirmButtonLabel}
        type="button"
      >
        {iconName && (
          <Icon
            className={classnames({ "u-animation--spin": isLoading })}
            name={iconName}
          />
        )}
        {toggleCaption && (
          <span className="confirmation-toggle-caption">{toggleCaption}</span>
        )}
      </Button>
    </>
  );
};

export default ConfirmationButton;
