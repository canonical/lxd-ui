import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";
import FormLink from "components/FormLink";
import InstanceClusterMemberMigration from "./InstanceClusterMemberMigration";
import BackLink from "components/BackLink";
import InstanceStoragePoolMigration from "./InstanceStoragePoolMigration";
import type { MigrationType } from "util/instanceMigration";
import { useInstanceMigration } from "util/instanceMigration";
import InstanceProjectMigration from "pages/instances/InstanceProjectMigration";

interface Props {
  close: () => void;
  instance: LxdInstance;
}

const MigrateInstanceModal: FC<Props> = ({ close, instance }) => {
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
  const [type, setType] = useState<MigrationType>("");
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
      title={target ? "Confirm migration" : selectStepTitle}
      onClick={handleGoBack}
      linkText={target ? `Choose ${type}` : "Choose migration method"}
    />
  );

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      title={modalTitle}
      onKeyDown={handleEscKey}
    >
      {!type && (
        <div className="choose-migration-type">
          {isClustered && (
            <FormLink
              icon="cluster-host"
              title="Migrate instance to a different cluster member"
              onClick={() => setType("cluster member")}
            />
          )}
          <FormLink
            icon="switcher-dashboard"
            title="Migrate instance root storage to a different pool"
            onClick={() => setType("root storage pool")}
          />
          <FormLink
            icon="folder"
            title="Migrate instance to a different project"
            onClick={() => setType("project")}
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

      {type === "root storage pool" && (
        <InstanceStoragePoolMigration
          instance={instance}
          onSelect={setTarget}
          targetPool={target}
          onCancel={handleGoBack}
          migrate={handleMigrate}
        />
      )}

      {type === "project" && (
        <InstanceProjectMigration
          instance={instance}
          onSelect={setTarget}
          targetProject={target}
          onCancel={handleGoBack}
          migrate={handleMigrate}
        />
      )}
    </Modal>
  );
};

export default MigrateInstanceModal;
