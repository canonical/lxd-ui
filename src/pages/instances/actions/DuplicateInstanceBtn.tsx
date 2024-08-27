import { FC } from "react";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import DuplicateInstanceForm from "../forms/DuplicateInstanceForm";
import classNames from "classnames";

interface Props {
  instance: LxdInstance;
  isLoading: boolean;
  classname?: string;
  onClose?: () => void;
}

const DuplicateInstanceBtn: FC<Props> = ({
  instance,
  isLoading,
  classname,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <DuplicateInstanceForm close={handleClose} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Duplicate instance"
        className={classNames("u-no-margin--bottom", classname)}
        disabled={isLoading}
        onClick={openPortal}
        title="Duplicate instance"
      >
        <span>Duplicate</span>
      </Button>
    </>
  );
};

export default DuplicateInstanceBtn;
