import { useOperations } from "context/operationsProvider";
import { Link } from "react-router-dom";
import ModifiedIcon from "components/ModifiedIcon";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { pluralize } from "util/helpers";
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
      <ModifiedIcon className="status-icon" />
      <Link to={`${ROOT_PATH}/ui/operations`}>{operationsStatus}</Link>
    </div>
  );
};

export default OperationStatus;
