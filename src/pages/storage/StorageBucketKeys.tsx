import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import useEventListener from "util/useEventListener";
import ItemName from "components/ItemName";
import SelectableMainTable from "components/SelectableMainTable";
import { useCurrentProject } from "context/useCurrentProject";
import ScrollableTable from "components/ScrollableTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import NotificationRow from "components/NotificationRow";
import CreateStorageBucketKeyBtn from "./actions/CreateStorageBucketKeyBtn";
import type { LxdStorageBucket } from "types/storage";
import { useLoadBucketKeys } from "context/useBuckets";

const collapsedViewMaxWidth = 1250;
export const figureCollapsedScreen = (): boolean =>
  window.innerWidth <= collapsedViewMaxWidth;

interface Props {
  bucket: LxdStorageBucket;
}

const StorageBucketKeys: FC<Props> = ({ bucket }) => {
  const docBaseLink = useDocs();
  const [query, setQuery] = useState<string>("");
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  // const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  const { project } = useCurrentProject();
  const { data: bucketKeys = [] } = useLoadBucketKeys(
    bucket,
    project?.name ?? "",
  );

  // const onSuccess = (message: ReactNode) => {
  //   toastNotify.success(message);
  // };

  // const onFailure = (title: string, e: unknown, message?: ReactNode) => {
  //   notify.failure(title, e, message);
  // };

  useEffect(() => {
    const validNames = new Set(bucketKeys?.map((key) => key.name));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [bucketKeys]);

  const filteredKeys =
    bucketKeys?.filter((key) => {
      if (query) {
        if (!key.name.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }
      return true;
    }) ?? [];

  const hasKeys = bucketKeys && bucketKeys.length > 0;

  const headers = [
    {
      content: isSmallScreen ? (
        <>
          Name
          <br />
          <div className="header-second-row">Role</div>
        </>
      ) : (
        "Name"
      ),
      sortKey: isSmallScreen ? "role" : "name",
      className: "name",
    },
    ...(isSmallScreen
      ? []
      : [
          {
            content: "Role",
            sortKey: "role",
            className: "role",
          },
        ]),
    {
      content: "Description",
      className: "description",
    },
    { content: "Access key", className: "key-field" },
    { content: "Secret key", className: "key-field" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = filteredKeys.map((key) => {
    const actions = (
      // <InstanceSnapshotActions
      //   instance={instance}
      //   snapshot={snapshot}
      //   onSuccess={onSuccess}
      //   onFailure={onFailure}
      // />
      <>Actions go here</>
    );

    return {
      key: key.name,
      className: "u-row",
      name: key.name,
      columns: [
        {
          content: (
            <>
              <div className="u-truncate" title={`Key ${key.name}`}>
                <ItemName item={key} />
              </div>
              {isSmallScreen && key.role}
            </>
          ),
          role: "rowheader",
          "aria-label": "Name",
          className: "name",
        },
        ...(isSmallScreen
          ? []
          : [
              {
                content: key.role,
                role: "cell",
                "aria-label": "Role at",
                className: "role",
              },
            ]),
        {
          content: key.description,
          role: "cell",
          "aria-label": "Description",
          className: "description",
        },
        {
          content: key["access-key"],
          role: "cell",
          "aria-label": "Access key",
          className: "key-field",
        },
        {
          content: key["secret-key"],
          role: "cell",
          "aria-label": "Secret key",
          className: "key-field",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: key.name.toLowerCase(),
        role: key.role,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "role",
    defaultSortDirection: "descending",
  });

  const resize = () => {
    setSmallScreen(figureCollapsedScreen());
  };
  useEventListener("resize", resize);

  return (
    <div className="storage-bucket-key-list">
      {hasKeys && (
        <div className="upper-controls-bar">
          {selectedNames.length === 0 ? (
            <>
              <div className="search-box-wrapper">
                <SearchBox
                  name="search-snapshot"
                  className="search-box margin-right"
                  type="text"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="Search for keys"
                  value={query}
                  aria-label="Search for keys"
                />
              </div>
              <CreateStorageBucketKeyBtn />
            </>
          ) : (
            <div className="p-panel__controls">
              {/* <InstanceSnapshotBulkDelete
                instance={instance}
                snapshotNames={selectedNames}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
                onSuccess={onSuccess}
                onFailure={onFailure}
              /> */}
            </div>
          )}
        </div>
      )}
      <NotificationRow />
      {hasKeys ? (
        <>
          <ScrollableTable
            dependencies={[filteredKeys, notify.notification]}
            tableId="buckets-key-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="key"
              className="u-no-margin--top"
              aria-label="Table pagination control"
              description={
                selectedNames.length > 0 && (
                  <SelectedTableNotification
                    totalCount={bucketKeys?.length ?? 0}
                    itemName="key"
                    parentName="bucket"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    filteredNames={filteredKeys.map((item) => item.name)}
                  />
                )
              }
            >
              <SelectableMainTable
                id="buckets-key-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="No key found matching this search"
                itemName="key"
                parentName="bucket"
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                // disabledNames={processingNames}
                disabledNames={[]}
                filteredNames={filteredKeys.map((key) => key.name)}
                onUpdateSort={updateSort}
                defaultSort="role"
                defaultSortDirection="descending"
              />
            </TablePagination>
          </ScrollableTable>
        </>
      ) : (
        <EmptyState
          className="empty-state"
          image={
            <Icon name="switcher-dashboard" className="empty-state-icon" />
          }
          title="No keys found in this bucket"
        >
          <p>
            <a
              href={`${docBaseLink}/explanation/storage/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about storage
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
          <CreateStorageBucketKeyBtn />
        </EmptyState>
      )}
    </div>
  );
};

export default StorageBucketKeys;
