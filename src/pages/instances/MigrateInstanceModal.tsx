import { FC, KeyboardEvent, useState } from "react";
import { Modal } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";
import FormLink from "components/FormLink";
import InstanceClusterMemberMigration from "./InstanceClusterMemberMigration";
import BackLink from "components/BackLink";
import InstanceStoragePoolMigration from "./InstanceStoragePoolMigration";
import { MigrationType, useInstanceMigration } from "util/instanceMigration";

interface Props {
  close: () => void;
  instance: LxdInstance;
}

const MigrateInstanceModal: FC<Props> = ({ close, instance }) => {
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
  const [type, setType] = useState<MigrationType>(
    isClustered ? "" : "root storage pool",
  );
  const [target, setTarget] = useState("");
  const { handleMigrate } = useInstanceMigration({
    onSuccess: close,
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
    // if lxd is not clustered, we close the modal
    if (!isClustered) {
      close();
      return;
    }

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
    <>
      {isClustered && (
        <BackLink
          title={target ? "Confirm migration" : selectStepTitle}
          onClick={handleGoBack}
          linkText={target ? `Choose ${type}` : "Choose migration method"}
        />
      )}
      {!isClustered && (target ? "Confirm migration" : selectStepTitle)}
    </>
  );

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      title={modalTitle}
      onKeyDown={handleEscKey}
    >
      {isClustered && !type && (
        <div className="choose-migration-type">
          <FormLink
            icon="machines"
            title="Migrate instance to a different cluster member"
            onClick={() => setType("cluster member")}
          />
          <FormLink
            icon="pods"
            title="Migrate instance root storage to a different pool"
            onClick={() => setType("root storage pool")}
          />
        </div>
      )}

      {type === "cluster member" && (
        <InstanceClusterMemberMigration
          instance={instance}
          onSelect={setTarget}
          targetMember={target}
          onCancel={handleGoBack}
          migrate={handleMigrate}
        />
      )}

      {/* If lxd is not clustered, we always show storage pool migration table */}
      {(type === "root storage pool" || !isClustered) && (
        <InstanceStoragePoolMigration
          instance={instance}
          onSelect={setTarget}
          targetPool={target}
          onCancel={handleGoBack}
          migrate={handleMigrate}
          isClustered={isClustered}
        />
      )}
    </Modal>
  );
};

export default MigrateInstanceModal;
