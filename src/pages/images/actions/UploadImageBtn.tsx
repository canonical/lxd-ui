import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import UploadImageForm from "./forms/UploadImageForm";
import { useSmallScreen } from "context/useSmallScreen";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  project: string;
}

const UploadImageBtn: FC<Props> = ({ project }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const isSmallScreen = useSmallScreen();
  const { canCreateImages } = useProjectEntitlements();

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
        disabled={!canCreateImages()}
        title={
          canCreateImages() ? "" : "You do not have permission to create images"
        }
      >
        {!isSmallScreen && <Icon name="upload" />}
        <span>Upload image</span>
      </Button>
    </>
  );
};

export default UploadImageBtn;
