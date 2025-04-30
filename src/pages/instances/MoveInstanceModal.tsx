import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import FormLink from "components/FormLink";
import InstanceClusterMemberMove from "./InstanceClusterMemberMove";
import BackLink from "components/BackLink";
import InstanceStoragePoolMove from "./InstanceStoragePoolMove";
import type { MoveType } from "util/instanceMigration";
import { useInstanceMigration } from "util/instanceMigration";
import InstanceProjectMove from "pages/instances/InstanceProjectMove";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  close: () => void;
  instance: LxdInstance;
}

const MoveInstanceModal: FC<Props> = ({ close, instance }) => {
  const isClustered = useIsClustered();
  const [type, setType] = useState<MoveType>("");
  const [target, setTarget] = useState("");
  const { handleMove } = useInstanceMigration({
    close,
    instance,
    type,
    target,
  });

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleGoBack = () => {
    // if target is set, we are on the confirmation stage
    if (target) {
      setTarget("");
      return;
    }

    // if type is set, we are on migration target selection stage
    if (type) {
      setType("");
      return;
    }
  };

  const selectStepTitle = (
    <>
      Choose {type} for instance <strong>{instance.name}</strong>
    </>
  );

  const modalTitle = !type ? (
    "Choose migration method"
  ) : (
    <BackLink
      title={target ? "Confirm move" : selectStepTitle}
      onClick={handleGoBack}
      linkText={target ? `Choose ${type}` : "Choose migration method"}
    />
  );

  return (
    <Modal
      close={close}
      className="move-instance-modal"
      title={modalTitle}
      onKeyDown={handleEscKey}
    >
      {!type && (
        <div className="choose-migration-type">
          {isClustered && (
            <FormLink
              icon="cluster-host"
              title="Migrate instance to a different cluster member"
              onClick={() => {
                setType("cluster member");
              }}
            />
          )}
          <FormLink
            icon="switcher-dashboard"
            title="Move instance root storage to a different pool"
            onClick={() => {
              setType("root storage pool");
            }}
          />
          <FormLink
            icon="folder"
            title="Move instance to a different project"
            onClick={() => {
              setType("project");
            }}
          />
        </div>
      )}

      {type === "cluster member" && (
        <InstanceClusterMemberMove
          instance={instance}
          onSelect={setTarget}
          targetMember={target}
          onCancel={handleGoBack}
          move={handleMove}
        />
      )}

      {type === "root storage pool" && (
        <InstanceStoragePoolMove
          instance={instance}
          onSelect={setTarget}
          targetPool={target}
          onCancel={handleGoBack}
          move={handleMove}
        />
      )}

      {type === "project" && (
        <InstanceProjectMove
          instance={instance}
          onSelect={setTarget}
          targetProject={target}
          onCancel={handleGoBack}
          move={handleMove}
        />
      )}
    </Modal>
  );
};

export default MoveInstanceModal;
