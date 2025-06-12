import { Icon } from "@canonical/react-components";
import { useOperations } from "context/operationsProvider";
import { useState } from "react";
import { isWidthBelow } from "util/helpers";
import useEventListener from "util/useEventListener";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";

const OperationStatus = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { runningOperations } = useOperations();

  useEventListener("resize", () => {
    setIsSmallScreen(isWidthBelow(620));
  });

  if (runningOperations.length === 0) {
    return null;
  }

  const operationsStatus = isSmallScreen
    ? `${runningOperations.length} ${pluralize("op", runningOperations.length)}...`
    : `${runningOperations.length} ${pluralize("operation", runningOperations.length)} in progress...`;

  return (
    <div className="operation-status" role="alert">
      <Icon name="status-in-progress-small" className="status-icon" />
      <Link to="/ui/operations">{operationsStatus}</Link>
    </div>
  );
};

export default OperationStatus;
