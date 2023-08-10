import React, { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { fetchOperations } from "api/operations";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import { useParams } from "react-router-dom";
import { isoTimeToString } from "util/helpers";
import { LxdOperationStatus } from "types/operation";
import OperationInstanceName from "pages/operations/OperationInstanceName";
import NotificationRow from "components/NotificationRow";

const OperationList: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: operationList,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.operations, project],
    queryFn: () => fetchOperations(project),
  });

  if (error) {
    notify.failure("Loading operations failed", error);
  }

  const failure = operationList?.failure ?? [];
  const running = operationList?.running ?? [];
  const success = operationList?.success ?? [];
  const operations = failure.concat(running).concat(success);

  const headers = [
    { content: "Time", className: "time", sortKey: "created_at" },
    { content: "Action", className: "action", sortKey: "action" },
    { content: "Info", className: "info" },
    { content: "Status", className: "status", sortKey: "status" },
    { "aria-label": "Cancel", className: "cancel u-align--right" },
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
    return {
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
            </>
          ),
          role: "rowheader",
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
                )
              )}
            </>
          ),
          role: "rowheader",
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
          role: "rowheader",
          "aria-label": "Status",
          className: "status",
        },
        {
          content: (
            <CancelOperationBtn operation={operation} project={project} />
          ),
          role: "rowheader",
          className: "u-align--right cancel",
          "aria-label": "Cancel",
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
      <BaseLayout title="Ongoing operations">
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
              <p>There are no ongoing operations in this project.</p>
            </EmptyState>
          )}
        </Row>
      </BaseLayout>
    </>
  );
};

export default OperationList;
