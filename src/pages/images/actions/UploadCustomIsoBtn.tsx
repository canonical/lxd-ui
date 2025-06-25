import type { FC } from "react";
import {
  Button,
  Icon,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import { usePortal } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ResourceLink from "components/ResourceLink";
import { useSmallScreen } from "context/useSmallScreen";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  className?: string;
  projectName: string;
}

const UploadCustomIsoBtn: FC<Props> = ({ className, projectName }) => {
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();
  const isSmallScreen = useSmallScreen();
  const { data: project } = useProject(projectName);
  const { canCreateStorageVolumes } = useProjectEntitlements();

  const handleCancel = () => {
    closePortal();
  };

  const handleFinish = (name: string) => {
    toastNotify.success(
      <>
        Custom ISO{" "}
        <ResourceLink
          to={`/ui/project/${encodeURIComponent(projectName)}/storage/custom-isos`}
          type="iso-volume"
          value={name}
        />{" "}
        uploaded successfully.
      </>,
    );
    queryClient.invalidateQueries({ queryKey: [queryKeys.isoVolumes] });
    closePortal();
  };

  return (
    <>
      <Button
        appearance="positive"
        onClick={openPortal}
        className={className}
        hasIcon={!isSmallScreen}
        disabled={!canCreateStorageVolumes(project)}
        title={
          canCreateStorageVolumes(project)
            ? "Upload custom ISO"
            : "You do not have permission to create custom ISOs in this project."
        }
      >
        {!isSmallScreen && <Icon name="upload" light />}
        <span>Upload custom ISO</span>
      </Button>
      {isOpen && (
        <Portal>
          <Modal close={closePortal} title="Upload custom ISO">
            <UploadCustomIso onCancel={handleCancel} onFinish={handleFinish} />
          </Modal>
        </Portal>
      )}
    </>
  );
};

export default UploadCustomIsoBtn;
