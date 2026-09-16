import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

const WarningsCardEmptyState = () => {
  return (
    <>
      <div className="overview-empty-state u-no-margin--bottom">
        <div className="overview-card-subtitle">No warnings found</div>
      </div>
      <div className="card-footer">
        <Link to={`${ROOT_PATH}/ui/warnings?status=new`}>Warnings list</Link>
      </div>
    </>
  );
};

export default WarningsCardEmptyState;
