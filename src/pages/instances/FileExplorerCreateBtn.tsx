import { type FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import FileExplorerCreateModal from "./forms/FileExplorerCreateModal";

interface Props {
  instance: LxdInstance;
  currentPath: string;
  refreshDirectoryList: () => void;
}

const FileExplorerCreateBtn: FC<Props> = ({
  instance,
  currentPath,
  refreshDirectoryList,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const isSmallScreen = useIsScreenBelow();
  const { canAccessInstanceFiles } = useInstanceEntitlements();
  const hasPermission = canAccessInstanceFiles(instance);

  const handleSuccess = () => {
    refreshDirectoryList();
    closePortal();
  };

  return (
    <>
      <Button
        onClick={openPortal}
        hasIcon={!isSmallScreen}
        disabled={!hasPermission || isOpen}
        className="u-no-margin--bottom"
        title={
          hasPermission
            ? "Create a new directory"
            : "You do not have permission to manage files on this instance"
        }
      >
        {!isSmallScreen && <Icon name="plus" />}
        <span>{isSmallScreen ? "Create" : "Create directory"}</span>
      </Button>
      {isOpen && (
        <Portal>
          <FileExplorerCreateModal
            close={closePortal}
            instance={instance}
            currentPath={currentPath}
            onSuccess={handleSuccess}
          />
        </Portal>
      )}
    </>
  );
};

export default FileExplorerCreateBtn;
