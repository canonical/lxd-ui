import { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ClusterMemberSelectTable from "../cluster/ClusterMemberSelectTable";

interface Props {
  instance: LxdInstance;
  onSelect: (member: string) => void;
  targetMember: string;
  onCancel: () => void;
  migrate: (member: string) => void;
}

const InstanceClusterMemberMigration: FC<Props> = ({
  instance,
  onSelect,
  targetMember,
  onCancel,
  migrate,
}) => {
  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate instance <strong>{instance.name}</strong> to cluster
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
            name: instance.location,
            reason: "Instance already on this member",
          }}
        />
      )}
      <footer id="migrate-instance-actions" className="p-modal__footer">
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
          onClick={() => migrate(targetMember)}
          disabled={!targetMember}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceClusterMemberMigration;
