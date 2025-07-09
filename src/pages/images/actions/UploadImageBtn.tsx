import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import UploadImageForm from "./forms/UploadImageForm";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  projectName: string;
}

const UploadImageBtn: FC<Props> = ({ projectName }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const isSmallScreen = useIsScreenBelow();
  const { data: project } = useProject(projectName);
  const { canCreateImages } = useProjectEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <UploadImageForm close={closePortal} projectName={projectName} />
        </Portal>
      )}
      <Button
        className="u-no-margin--bottom"
        onClick={openPortal}
        hasIcon={!isSmallScreen}
        disabled={!canCreateImages(project)}
        title={
          canCreateImages(project)
            ? ""
            : "You do not have permission to create images"
        }
      >
        {!isSmallScreen && <Icon name="upload" />}
        <span>{isSmallScreen ? "Upload" : "Upload image"}</span>
      </Button>
    </>
  );
};

export default UploadImageBtn;
