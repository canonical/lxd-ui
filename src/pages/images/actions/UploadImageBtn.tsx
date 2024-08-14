import { FC } from "react";
import { ActionButton } from "@canonical/react-components";
import usePortal from "react-useportal";
import UploadImageForm from "./forms/UploadImageForm";

interface Props {
  project: string;
}

const UploadImageBtn: FC<Props> = ({ project }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <UploadImageForm close={closePortal} project={project} />
        </Portal>
      )}
      <ActionButton className="u-no-margin--bottom" onClick={openPortal}>
        <span>Upload image</span>
      </ActionButton>
    </>
  );
};

export default UploadImageBtn;
