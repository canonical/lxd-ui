import { useId, type FC } from "react";
import { Card, Chip } from "@canonical/react-components";
import ExplanationTooltip from "components/ExplanationTooltip";
import type { LxdReplicator } from "types/replicator";
import { isoTimeToString } from "util/helpers";
import { getLastSuccessStartedAt } from "util/replicator";

interface Props {
  replicator: LxdReplicator;
}

const ReplicatorLatestSuccessfulRun: FC<Props> = ({ replicator }) => {
  const titleId = useId();
  const completedAt = isoTimeToString(replicator.last_success_at ?? "");

  if (!completedAt) {
    return (
      <p className="u-align-text--center">
        No run history found for this replicator.
      </p>
    );
  }

  const startedAt = isoTimeToString(getLastSuccessStartedAt(replicator) ?? "");
  const recoveryPoint = isoTimeToString(
    replicator.last_success_oldest_snapshot_at ?? "",
  );

  return (
    <Card
      className="replicator-run-card"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="replicator-run-card__header">
        <h3
          id={titleId}
          className="p-heading--5 u-no-margin--bottom u-no-padding--top"
        >
          Latest successful run
        </h3>
        <Chip
          value="Completed"
          appearance="positive"
          isDense
          isReadOnly
          className="u-no-margin--bottom"
        />
        {startedAt && (
          <span className="replicator-run-card__started u-text--muted">
            Started {startedAt}
          </span>
        )}
      </div>
      <dl className="replicator-run-card__times u-no-margin--bottom">
        <div className="replicator-run-card__time">
          <dt>Completed</dt>
          <dd>{completedAt}</dd>
        </div>
        <div className="replicator-run-card__time">
          <dt>
            <ExplanationTooltip explanation="Your recovery point is the oldest snapshot in your last successful replication.">
              Recovery point
            </ExplanationTooltip>
          </dt>
          <dd>{recoveryPoint || "-"}</dd>
        </div>
      </dl>
    </Card>
  );
};

export default ReplicatorLatestSuccessfulRun;
