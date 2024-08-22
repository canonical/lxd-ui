import { FC } from "react";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import DuplicateInstanceForm from "../forms/DuplicateInstanceForm";

interface Props {
  instance: LxdInstance;
  isLoading: boolean;
}

const DuplicateInstanceBtn: FC<Props> = ({ instance, isLoading }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <DuplicateInstanceForm close={closePortal} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Duplicate instance"
        className="u-no-margin--bottom"
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
