import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import ImportImageForm from "./forms/ImportImageForm";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  projectName: string;
}

const ImportImageBtn: FC<Props> = ({ projectName }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const isSmallScreen = useIsScreenBelow();
  const { data: project } = useProject(projectName);
  const { canCreateImages } = useProjectEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <ImportImageForm close={closePortal} projectName={projectName} />
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
        {!isSmallScreen && <Icon name="import" />}
        <span>{isSmallScreen ? "Import" : "Import image"}</span>
      </Button>
    </>
  );
};

export default ImportImageBtn;
