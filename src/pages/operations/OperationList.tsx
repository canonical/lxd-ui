import { useState, type FC, type ReactNode } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { useOperationsWithChildren } from "context/operationsProvider";
import OperationExplanationTooltip from "pages/operations/OperationExplanationTooltip";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import ChildOperationTrigger from "pages/operations/ChildOperationTrigger";
import OperationDescription from "pages/operations/OperationDescription";
import OperationTimeDates from "pages/operations/OperationTimeDates";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import RefreshOperationsBtn from "pages/operations/actions/RefreshOperationsBtn";
import type { LxdOperation } from "types/operation";
import {
  getIconNameForStatus,
  getInstanceName,
  getProjectName,
} from "util/operations";
import useSortTableData from "util/useSortTableData";
import DsIcon from "components/DsIcon";

const renderParentFirstColumnContent = ({
  operation,
  isExpanded,
  onToggleExpansion,
}: {
  operation: LxdOperation;
  isExpanded: boolean;
  onToggleExpansion: (id: string) => void;
}) => {
  return (
    <div className="time-cell-content">
      <OperationTimeDates operation={operation} />
      <ChildOperationTrigger
        operation={operation}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
      />
    </div>
  );
};

const renderChildFirstColumnContent = (operation: LxdOperation) => {
  return (
    <>
      <div className="child-tree-rail">
        <span className="tree-connector" />
      </div>
      <div className="time-cell-content">
        <OperationTimeDates operation={operation} />
      </div>
    </>
  );
};

const buildOperationRow = ({
  operation,
  className,
  timeContent,
  sortData,
}: {
  operation: LxdOperation;
  className: string;
  timeContent: ReactNode;
  sortData: Record<string, unknown>;
}) => {
  return {
    key: operation.id,
    className,
    columns: [
      {
        content: timeContent,
        role: "cell",
        "aria-label": "Time",
        className: "time",
      },
      {
        content: <OperationDescription operation={operation} />,
        role: "rowheader",
        "aria-label": "Description",
        className: "description",
      },
      {
        content: (
          <>
            {operation.err && <div>{operation.err}</div>}
            {Object.entries(operation.metadata ?? {}).map(
              ([metaKey, value]) => (
                <div key={metaKey}>
                  <span title={JSON.stringify(value)}>
                    {metaKey}: {JSON.stringify(value)}
                  </span>
                </div>
              ),
            )}
          </>
        ),
        role: "cell",
        "aria-label": "Details",
        className: "details",
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
    sortData,
  };
};

const OperationList: FC = () => {
  const notify = useNotify();
  const { operations, isLoading, error } = useOperationsWithChildren();

  const [query, setQuery] = useState<string>("");
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  if (error) {
    notify.failure("Loading operations failed", error);
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const headers = [
    { content: "Time", className: "time", sortKey: "created_at" },
    {
      content: "Description",
      className: "description",
      sortKey: "description",
    },
    { content: "Details", className: "details" },
    { content: "Status", className: "status status-header", sortKey: "status" },
    { "aria-label": "Actions", className: "cancel u-align--right" },
  ];

  const filteredOperations = operations.filter((operation) => {
    const lowerCaseQuery = query.toLowerCase();

    return (
      operation.description.toLowerCase().includes(lowerCaseQuery) ||
      getProjectName(operation).toLowerCase().includes(lowerCaseQuery) ||
      operation.status.toLowerCase().includes(lowerCaseQuery) ||
      getInstanceName(operation).toLowerCase().includes(lowerCaseQuery)
    );
  });

  const rows = filteredOperations.flatMap((operation) => {
    const childOperations = operation.children ?? [];
    const childCount = childOperations.length || operation.child_count || 0;
    const hasChildOperations = childCount > 0;
    const isExpanded = expandedRowIds.has(operation.id);

    const parentRowSortData = {
      created_at: operation.created_at,
      description: operation.description,
      status: operation.status,
    };

    const parentRow = buildOperationRow({
      operation,
      className: "u-row",
      timeContent: renderParentFirstColumnContent({
        operation,
        isExpanded,
        onToggleExpansion: toggleRowExpansion,
      }),
      sortData: parentRowSortData,
    });

    if (!isExpanded || !hasChildOperations) {
      return [parentRow];
    }

    const childRows = childOperations.map((child) => {
      return buildOperationRow({
        operation: child,
        className: "u-row child-operation-row",
        timeContent: renderChildFirstColumnContent(child),
        sortData: parentRowSortData,
      });
    });

    return [parentRow, ...childRows];
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "created_at",
    defaultSortDirection: "descending",
  });

  return (
    <>
      <CustomLayout
        mainClassName="operation-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <OperationExplanationTooltip>
                  Ongoing operations
                </OperationExplanationTooltip>
              </PageHeader.Title>
              {operations.length > 0 && (
                <PageHeader.Search>
                  <SearchBox
                    className="search-box margin-right--large u-no-margin--bottom"
                    name="search-operations"
                    onChange={setQuery}
                    placeholder="Search"
                    value={query}
                    aria-label="Search"
                  />
                </PageHeader.Search>
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <RefreshOperationsBtn />
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row>
          {operations.length > 0 && (
            <ScrollableTable
              dependencies={[filteredOperations, notify.notification]}
              tableId="operation-table"
              belowIds={["status-bar"]}
            >
              <TablePagination
                data={sortedRows}
                id="pagination"
                itemName="operation"
                className="u-no-margin--top"
                aria-label="Table pagination control"
              >
                <MainTable
                  id="operation-table"
                  className="operation-table"
                  headers={headers}
                  sortable
                  responsive
                  onUpdateSort={updateSort}
                  emptyStateMsg={
                    isLoading ? (
                      <Spinner
                        className="u-loader"
                        text="Loading operations..."
                      />
                    ) : (
                      "No matching operations found"
                    )
                  }
                />
              </TablePagination>
            </ScrollableTable>
          )}
          {!isLoading && operations.length === 0 && (
            <EmptyState
              className="empty-state"
              image={<DsIcon icon="status" className="empty-state-icon" />}
              title="No operations found"
            >
              <p>There are no ongoing operations.</p>
            </EmptyState>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default OperationList;
