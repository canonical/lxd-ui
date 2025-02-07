import { FC } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import CreateInstanceFromSnapshotForm from "../../forms/CreateInstanceFromSnapshotForm";
import { useProjectEntitlementSet } from "util/entitlements/projects";
import { useProjects } from "context/useProjects";

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
  const { data: projects } = useProjects();
  const { canCreateInstancesSet } = useProjectEntitlementSet(projects || []);

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
        disabled={isDeleting || isRestoring || !canCreateInstancesSet.size}
        onClick={openPortal}
        title={
          canCreateInstancesSet.size
            ? "Create instance"
            : "You do not have permission to create instances in any project"
        }
      >
        <Icon name="plus" />
      </Button>
    </>
  );
};

export default CreateInstanceFromSnapshotBtn;
