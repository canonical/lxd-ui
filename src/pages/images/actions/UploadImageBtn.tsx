import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePortal from "react-useportal";
import UploadImageForm from "./forms/UploadImageForm";
import { useSmallScreen } from "context/useSmallScreen";

interface Props {
  project: string;
}

const UploadImageBtn: FC<Props> = ({ project }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const isSmallScreen = useSmallScreen();

  return (
    <>
      {isOpen && (
        <Portal>
          <UploadImageForm close={closePortal} project={project} />
        </Portal>
      )}
      <Button
        className="u-no-margin--bottom"
        onClick={openPortal}
        hasIcon={!isSmallScreen}
      >
        {!isSmallScreen && <Icon name="upload" />}
        <span>Upload image</span>
      </Button>
    </>
  );
};

export default UploadImageBtn;
