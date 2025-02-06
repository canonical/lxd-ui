import { FC } from "react";
import { usePortal } from "@canonical/react-components";
import { Button, Icon } from "@canonical/react-components";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import CreateImageFromInstanceSnapshotForm from "pages/instances/forms/CreateImageFromInstanceSnapshotForm";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  isDeleting: boolean;
  isRestoring: boolean;
}

const CreateImageFromInstanceSnapshotBtn: FC<Props> = ({
  instance,
  snapshot,
  isDeleting,
  isRestoring,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { data: project } = useProject(instance.project);
  const { canCreateImages } = useProjectEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateImageFromInstanceSnapshotForm
            close={closePortal}
            instance={instance}
            snapshot={snapshot}
          />
        </Portal>
      )}
      <Button
        appearance="base"
        hasIcon
        dense={true}
        disabled={isDeleting || isRestoring || !canCreateImages(project)}
        onClick={openPortal}
        type="button"
        aria-label="Create image"
        title={
          canCreateImages(project)
            ? "Create image"
            : "You do not have permission to create images in this project"
        }
      >
        <Icon name="export" />
      </Button>
    </>
  );
};

export default CreateImageFromInstanceSnapshotBtn;
