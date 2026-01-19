import type { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import ClusterMemberSelectTable from "../cluster/ClusterMemberSelectTable";
import type { LxdStorageVolume } from "types/storage";

interface Props {
  volume: LxdStorageVolume;
  onSelect: (member: string) => void;
  targetMember: string;
  onCancel: () => void;
  migrate: (member: string) => void;
}

const StorageVolumeClusterMemberMigration: FC<Props> = ({
  volume,
  onSelect,
  targetMember,
  onCancel,
  migrate,
}) => {
  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate volume <strong>{volume.name}</strong> to cluster
        member <b>{targetMember}</b>.
      </p>
    </div>
  );

  return (
    <>
      {targetMember && summary}
      {!targetMember && (
        <ClusterMemberSelectTable
          onSelect={onSelect}
          disableMember={{
            name: volume.location,
            reason: "Volume already on this member",
          }}
        />
      )}
      <footer id="migrate-volume-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel migrate"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => {
            migrate(targetMember);
          }}
          disabled={!targetMember}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default StorageVolumeClusterMemberMigration;
