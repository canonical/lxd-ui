import type { FC, KeyboardEvent, ReactNode } from "react";
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
import { useStoragePool } from "context/useStoragePools";

interface Props {
  close: () => void;
  volume: LxdStorageVolume;
}

const MigrateVolumeModal: FC<Props> = ({ close, volume }) => {
  const [type, setType] = useState<VolumeMigrationType>("");
  const [target, setTarget] = useState("");
  const isClustered = useIsClustered();
  const { data: pool } = useStoragePool(volume.pool);
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

  const renderTitle = (): ReactNode => {
    if (!type) {
      return "Choose migration method";
    }
    if (target) {
      return (
        <BackLink
          title="Confirm migration"
          linkText={`Choose ${type}`}
          onClick={handleGoBack}
        />
      );
    }
    return (
      <BackLink
        title={
          <>
            Choose {type} for volume <strong>{volume.name}</strong>
          </>
        }
        linkText="Choose migration method"
        onClick={handleGoBack}
      />
    );
  };

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
          {renderTitle()}
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
          {isClustered && isClusterLocalDriver(pool?.driver || "") && (
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
            title={`Move volume to a different storage pool`}
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
