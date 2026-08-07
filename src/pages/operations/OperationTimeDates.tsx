import type { FC } from "react";
import type { LxdOperation } from "types/operation";
import { isoTimeToString, nonBreakingSpaces } from "util/helpers";

interface Props {
  operation: LxdOperation;
}

const OperationTimeDates: FC<Props> = ({ operation }) => {
  return (
    <>
      <div className="date-pair">
        Initiated: {nonBreakingSpaces(isoTimeToString(operation.created_at))}
      </div>
      <div className="date-pair u-text--muted">
        Last update: {nonBreakingSpaces(isoTimeToString(operation.updated_at))}
      </div>
    </>
  );
};

export default OperationTimeDates;
