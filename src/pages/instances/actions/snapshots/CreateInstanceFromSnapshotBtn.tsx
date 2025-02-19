import { FC } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import CreateInstanceFromSnapshotForm from "../../forms/CreateInstanceFromSnapshotForm";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  isDeleting: boolean;
  isRestoring: boolean;
}

const CreateInstanceFromSnapshotBtn: FC<Props> = ({
  instance,
  snapshot,
  isDeleting,
  isRestoring,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { data: projects = [] } = useProjects();
  const { canCreateInstances } = useProjectEntitlements();

  const validTargetProjects = projects.filter(canCreateInstances);

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateInstanceFromSnapshotForm
            close={closePortal}
            instance={instance}
            snapshot={snapshot}
          />
        </Portal>
      )}
      <Button
        appearance="base"
        hasIcon
        dense
        aria-label="Create instance"
        disabled={isDeleting || isRestoring || !validTargetProjects.length}
        onClick={openPortal}
        title={
          validTargetProjects.length > 0
            ? "Create instance"
            : "You do not have permission to create instances"
        }
      >
        <Icon name="plus" />
      </Button>
    </>
  );
};

export default CreateInstanceFromSnapshotBtn;
