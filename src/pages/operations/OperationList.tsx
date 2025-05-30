import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import Loader from "components/Loader";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import { isoTimeToString } from "util/helpers";
import type { LxdOperationStatus } from "types/operation";
import OperationInstanceName from "pages/operations/OperationInstanceName";
import NotificationRow from "components/NotificationRow";
import { getProjectName } from "util/operations";
import { useOperations } from "context/operationsProvider";
import RefreshOperationsBtn from "pages/operations/actions/RefreshOperationsBtn";

const OperationList: FC = () => {
  const notify = useNotify();
  const { operations, isLoading, error } = useOperations();

  if (error) {
    notify.failure("Loading operations failed", error);
  }

  const headers = [
    { content: "Time", className: "time", sortKey: "created_at" },
    { content: "Action", className: "action", sortKey: "action" },
    { content: "Info", className: "info" },
    { content: "Status", className: "status", sortKey: "status" },
    { "aria-label": "Actions", className: "cancel u-align--right" },
  ];

  const getIconNameForStatus = (status: LxdOperationStatus) => {
    return {
      Cancelled: "status-failed-small",
      Failure: "status-failed-small",
      Running: "status-in-progress-small",
      Success: "status-succeeded-small",
    }[status];
  };

  const rows = operations.map((operation) => {
    const projectName = getProjectName(operation);
    return {
      key: operation.id,
      columns: [
        {
          content: (
            <>
              <div>Initiated: {isoTimeToString(operation.created_at)}</div>
              <div className="u-text--muted">
                Last update: {isoTimeToString(operation.updated_at)}
              </div>
            </>
          ),
          role: "rowheader",
          "aria-label": "Time",
          className: "time",
        },
        {
          content: (
            <>
              <div>{operation.description}</div>
              <div className="u-truncate u-text--muted">
                <OperationInstanceName operation={operation} />
              </div>
              <div className="u-text--muted u-truncate" title={projectName}>
                Project: {projectName}
              </div>
            </>
          ),
          role: "cell",
          "aria-label": "Action",
          className: "action",
        },
        {
          content: (
            <>
              <div>{operation.err}</div>
              {Object.entries(operation.metadata ?? {}).map(
                ([key, value], index) => (
                  <span key={index} title={JSON.stringify(value)}>
                    {key}: {JSON.stringify(value)}
                  </span>
                ),
              )}
            </>
          ),
          role: "cell",
          "aria-label": "Info",
          className: "info",
        },
        {
          content: (
            <>
              <Icon
                name={getIconNameForStatus(operation.status)}
                className="status-icon"
              />
              {operation.status}
            </>
          ),
          role: "cell",
          "aria-label": "Status",
          className: "status",
        },
        {
          content: <CancelOperationBtn operation={operation} />,
          role: "cell",
          className: "u-align--right cancel",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        created_at: operation.created_at,
        action: operation.description,
        status: operation.status,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Ongoing operations"
        controls={<RefreshOperationsBtn />}
      >
        <NotificationRow />
        <Row>
          {operations.length > 0 && (
            <MainTable
              headers={headers}
              rows={rows}
              paginate={30}
              responsive
              sortable
              className="operation-list"
              emptyStateMsg={
                isLoading ? (
                  <Loader text="Loading operations..." />
                ) : (
                  "No data to display"
                )
              }
            />
          )}
          {!isLoading && operations.length === 0 && (
            <EmptyState
              className="empty-state"
              image={<Icon name="status" className="empty-state-icon" />}
              title="No operations found"
            >
              <p>There are no ongoing operations.</p>
            </EmptyState>
          )}
        </Row>
      </BaseLayout>
    </>
  );
};

export default OperationList;
