import type { FC } from "react";
import { Button, Icon, List } from "@canonical/react-components";
import type { LxdOperation, LxdOperationStatus } from "types/operation";
import { pluralize } from "util/helpers";
import { countByStatus } from "util/operations";

interface Props {
  operation: LxdOperation;
  isExpanded: boolean;
  onToggleExpansion: (id: string) => void;
}

const ChildOperationTrigger: FC<Props> = ({
  operation,
  isExpanded,
  onToggleExpansion,
}) => {
  const childOperations = operation.children ?? [];
  const childCount = childOperations.length || 0;

  if (childCount === 0) {
    return null;
  }

  const statusCount = countByStatus(childOperations);
  const childStatusItems = (
    ["Running", "Failure", "Cancelled"] as LxdOperationStatus[]
  )
    .map((status) => {
      const count = statusCount[status] ?? 0;
      return count > 0 ? `${count} ${status.toLowerCase()}` : "";
    })
    .filter(Boolean);

  return (
    <div className="child-operations-trigger">
      <Button
        hasIcon
        dense
        appearance="base"
        onClick={() => {
          onToggleExpansion(operation.id);
        }}
        aria-expanded={isExpanded}
        className="bulk-toggle-btn"
      >
        <span className="p-chip is-dense u-no-margin">
          <Icon name={isExpanded ? "chevron-up" : "chevron-down"} />
          <List
            middot
            items={[
              `${childCount} ${pluralize("child operation", childCount)}`,
              ...childStatusItems,
            ]}
            className="u-no-margin--bottom"
          />
        </span>
      </Button>
    </div>
  );
};

export default ChildOperationTrigger;
