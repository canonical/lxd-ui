import type { FC } from "react";
import OperationInstanceName from "pages/operations/OperationInstanceName";
import type { LxdOperation } from "types/operation";
import { getProjectName } from "util/operations";

interface Props {
  operation: LxdOperation;
}

const OperationDescription: FC<Props> = ({ operation }) => {
  const projectName = getProjectName(operation);

  return (
    <>
      <div>{operation.description}</div>
      <OperationInstanceName operation={operation} />
      <div className="u-text--muted u-truncate" title={projectName}>
        Project: {projectName}
      </div>
    </>
  );
};

export default OperationDescription;
