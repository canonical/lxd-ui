import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import type { LxdReplicator } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  onClose?: () => void;
}

const RunReplicatorBtn: FC<Props> = ({ replicator, className, onClose }) => {
  return (
    <Button
      appearance="default"
      aria-label="Run replicator"
      className={classnames("u-no-margin--bottom has-icon", className)}
      onClick={() => {
        console.log(
          `Run replicator ${replicator.name} btn clicked. TODO: open modal`,
          onClose,
        );
      }}
      title="Run replicator"
    >
      <Icon name="play" />
      <span>Run</span>
    </Button>
  );
};

export default RunReplicatorBtn;
