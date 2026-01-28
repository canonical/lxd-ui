import { Icon } from "@canonical/react-components";
import { useOperations } from "context/operationsProvider";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { ROOT_PATH } from "util/rootPath";

const OperationStatus = () => {
  const isSmallScreen = useIsScreenBelow();
  const { runningOperations } = useOperations();

  if (runningOperations.length === 0) {
    return null;
  }

  const operationsStatus = isSmallScreen
    ? `${runningOperations.length} ${pluralize("op", runningOperations.length)}...`
    : `${runningOperations.length} ${pluralize("operation", runningOperations.length)} in progress...`;

  return (
    <div className="operation-status" role="alert">
      <Icon name="status-in-progress-small" className="status-icon" />
      <Link to={`${ROOT_PATH}/ui/operations`}>{operationsStatus}</Link>
    </div>
  );
};

export default OperationStatus;
