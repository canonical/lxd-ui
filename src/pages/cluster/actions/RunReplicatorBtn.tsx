import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import type { LxdReplicator } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  hasLabel?: boolean;
  onClose?: () => void;
}

const RunReplicatorBtn: FC<Props> = ({
  replicator,
  className,
  onClose,
  hasLabel = false,
}) => {
  return (
    <Button
      appearance={hasLabel ? "default" : "base"}
      aria-label="Run replicator"
      className={classnames(
        "u-no-margin--bottom has-icon",
        {
          "is-dense": !hasLabel,
        },
        className,
      )}
      onClick={() => {
        console.log(
          `Run replicator ${replicator.name} btn clicked. TODO: open modal`,
          onClose,
        );
      }}
      title="Run replicator"
    >
      <Icon name="play" />
      {hasLabel && <span>Run</span>}
    </Button>
  );
};

export default RunReplicatorBtn;
