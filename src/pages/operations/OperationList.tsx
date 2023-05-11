import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { useNotify } from "context/notify";
import EmptyState from "components/EmptyState";
import { fetchOperations } from "api/operations";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import { useParams } from "react-router-dom";
import { isoTimeToString } from "util/helpers";

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
    queryKey: [queryKeys.networks],
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
    { content: "Date created", sortKey: "created_at" },
    { content: "Date updated", sortKey: "updated_at" },
    { content: "Action", sortKey: "action" },
    { content: "Item" },
    { content: "Info" },
    { content: "Status", sortKey: "status" },
    { "aria-label": "Actions", className: "u-align--right" },
  ];

  const rows = operations.map((operation) => {
    return {
      columns: [
        {
          content: isoTimeToString(operation.created_at),
          role: "rowheader",
          "aria-label": "Date created",
        },
        {
          content: isoTimeToString(operation.updated_at),
          role: "rowheader",
          "aria-label": "Date updated",
        },
        {
          content: operation.description,
          role: "rowheader",
          "aria-label": "action",
        },
        {
          content: operation.resources.instances?.join(" "),
          role: "rowheader",
          "aria-label": "item",
        },
        {
          content: (
            <>
              <div>{operation.err}</div>
              {Object.entries(operation.metadata ?? {}).map(
                ([key, value], index) => (
                  <div key={index}>
                    {key}: {JSON.stringify(value)}
                  </div>
                )
              )}
            </>
          ),
          role: "rowheader",
          "aria-label": "info",
        },
        {
          content: operation.status,
          role: "rowheader",
          "aria-label": "status",
        },
        {
          content: <CancelOperationBtn operation={operation} />,
          role: "rowheader",
          "aria-label": "action",
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
              className="u-table-layout--auto"
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
              iconName="status"
              iconClass="empty-operations-icon"
              title="No operations found"
              message="There are no ongoing operations in this project."
            />
          )}
        </Row>
      </BaseLayout>
    </>
  );
};

export default OperationList;
