import { Icon } from "@canonical/react-components";
import { useOperations } from "context/operationsProvider";
import { useState } from "react";
import { isWidthBelow } from "util/helpers";
import useEventListener from "@use-it/event-listener";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";

const OperationStatus = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { runningOperations } = useOperations();

  useEventListener("resize", () => setIsSmallScreen(isWidthBelow(620)));

  let operationsStatus = `${runningOperations.length} ${pluralize("operation", runningOperations.length)} in progress...`;
  if (isSmallScreen) {
    operationsStatus = `${runningOperations.length} Ops`;
  }

  return runningOperations.length ? (
    <div className="operation-status" role="alert">
      <Icon name="status-in-progress-small" className="status-icon" />
      <Link to="ui/operations">{operationsStatus}</Link>
    </div>
  ) : null;
};

export default OperationStatus;
