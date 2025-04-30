import type { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ClusterMemberSelectTable from "../cluster/ClusterMemberSelectTable";

interface Props {
  instance: LxdInstance;
  onSelect: (member: string) => void;
  targetMember: string;
  onCancel: () => void;
  move: (member: string) => void;
}

const InstanceClusterMemberMove: FC<Props> = ({
  instance,
  onSelect,
  targetMember,
  onCancel,
  move,
}) => {
  const summary = (
    <div className="move-instance-summary">
      <p>
        This will move instance <strong>{instance.name}</strong> to cluster
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
      <footer id="move-instance-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel move"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => {
            move(targetMember);
          }}
          disabled={!targetMember}
        >
          Move
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceClusterMemberMove;
