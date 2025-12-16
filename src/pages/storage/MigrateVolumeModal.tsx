import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import FormLink from "components/FormLink";
import { useIsClustered } from "context/useIsClustered";
import {
  useStorageVolumeMigration,
  type VolumeMigrationType,
} from "util/storageVolumeMigration";
import StorageVolumePoolMigration from "./StorageVolumePoolMigration";
import BackLink from "components/BackLink";
import StorageVolumeClusterMemberMigration from "./StorageVolumeClusterMemberMigration";
import StorageVolumeProjectMigration from "./StorageVolumeProjectMigration";
import { isClusterLocalDriver } from "util/storagePool";

interface Props {
  close: () => void;
  volume: LxdStorageVolume;
  project: string;
}

const MigrateVolumeModal: FC<Props> = ({ close, volume, project }) => {
  const [type, setType] = useState<VolumeMigrationType>("");
  const [target, setTarget] = useState("");
  const isClustered = useIsClustered();
  const { handleMigrate, handleMemberMigrate } = useStorageVolumeMigration({
    close,
    volume,
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
      Choose {type} for volume <strong>{volume.name}</strong>
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
      onKeyDown={handleEscKey}
    >
      <header className="p-modal__header">
        <h2
          className="p-modal__title"
          key={type ? (target ? "confirm" : "select") : "start"}
          id="migrate-title"
        >
          {modalTitle}
        </h2>
        <button
          className="p-modal__close"
          aria-label="Close active modal"
          onClick={close}
        >
          Close
        </button>
      </header>
      {!type && (
        <div className="choose-migration-type">
          {isClustered && isClusterLocalDriver(volume.pool) && (
            <FormLink
              icon="cluster-host"
              title="Migrate volume to a different cluster member"
              onClick={() => {
                setType("cluster member");
              }}
            />
          )}
          <FormLink
            icon="switcher-dashboard"
            title={`Choose storage pool for volume ${volume.name}`}
            onClick={() => {
              setType("pool");
            }}
          />
          <FormLink
            icon="folder"
            title="Move volume to a different project"
            onClick={() => {
              setType("project");
            }}
          />
        </div>
      )}

      {type === "cluster member" && (
        <StorageVolumeClusterMemberMigration
          volume={volume}
          onSelect={setTarget}
          targetMember={target}
          onCancel={handleGoBack}
          migrate={handleMemberMigrate}
        />
      )}

      {type === "pool" && (
        <StorageVolumePoolMigration
          volume={volume}
          onSelect={setTarget}
          project={project}
          onCancel={handleGoBack}
          migrate={handleMigrate}
        />
      )}

      {type === "project" && (
        <StorageVolumeProjectMigration
          volume={volume}
          onSelect={setTarget}
          targetProject={target}
          onCancel={handleGoBack}
          migrate={handleMigrate}
        />
      )}
    </Modal>
  );
};

export default MigrateVolumeModal;
