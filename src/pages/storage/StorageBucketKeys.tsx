import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import ItemName from "components/ItemName";
import SelectableMainTable from "components/SelectableMainTable";
import { useCurrentProject } from "context/useCurrentProject";
import SelectedTableNotification from "components/SelectedTableNotification";
import useSortTableData from "util/useSortTableData";
import NotificationRow from "components/NotificationRow";
import CreateStorageBucketKeyBtn from "./actions/CreateStorageBucketKeyBtn";
import type { LxdStorageBucket } from "types/storage";
import { useBucketKeys } from "context/useBuckets";
import StorageBucketKeyActions from "./actions/StorageBucketKeyActions";
import StorageBucketKeyBulkDelete from "./actions/StorageBucketKeyBulkDelete";
import { capitalizeFirstLetter } from "util/helpers";
import DocLink from "components/DocLink";

interface Props {
  bucket: LxdStorageBucket;
}

const StorageBucketKeys: FC<Props> = ({ bucket }) => {
  const [query, setQuery] = useState<string>("");
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const { project } = useCurrentProject();
  const { data: keys = [] } = useBucketKeys(bucket, project?.name ?? "");

  useEffect(() => {
    const validNames = new Set(keys?.map((key) => key.name));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [keys]);

  const filteredKeys =
    keys?.filter((key) => {
      if (query) {
        const q = query.toLowerCase();

        return (
          key.name.toLowerCase().includes(q) ||
          key.role.toLowerCase().includes(q) ||
          key.description.toLowerCase().includes(q) ||
          key["access-key"].toLowerCase().includes(q) ||
          key["secret-key"].toLowerCase().includes(q)
        );
      }
      return true;
    }) ?? [];

  const hasKeys = keys && keys.length > 0;

  const headers = [
    {
      content: "Name",
      sortKey: "name",
      className: "name",
    },
    {
      content: "Role",
      sortKey: "role",
      className: "role",
    },
    {
      content: "Description",
      sortKey: "description",
      className: "description",
    },
    { content: "Access key", className: "key-field", sortKey: "access-key" },
    { content: "Secret key", className: "key-field", sortKey: "secret-key" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = filteredKeys.map((key) => {
    return {
      key: key.name,
      className: "u-row",
      name: key.name,
      columns: [
        {
          content: (
            <div className="u-truncate" title={`Key ${key.name}`}>
              <ItemName item={key} />
            </div>
          ),
          role: "rowheader",
          "aria-label": "Name",
          className: "name",
        },
        {
          content: capitalizeFirstLetter(key.role),
          role: "cell",
          "aria-label": "Role",
          className: "role",
        },
        {
          content: key.description || "-",
          title: key.description,
          role: "cell",
          "aria-label": "Description",
          className: "description u-truncate",
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
          content: <StorageBucketKeyActions bucketKey={key} bucket={bucket} />,
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: key.name.toLowerCase(),
        role: key.role,
        description: key.description.toLowerCase(),
        "access-key": key["access-key"],
        "secret-key": key["secret-key"],
      },
    };
  });

  const selectedKeys = keys.filter((key) => {
    return selectedNames.includes(key.name);
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
    defaultSortDirection: "ascending",
  });

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
              <StorageBucketKeyBulkDelete
                keys={selectedKeys}
                bucket={bucket}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
              />
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
                    totalCount={keys?.length ?? 0}
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
                disabledNames={processingNames}
                filteredNames={filteredKeys.map((item) => item.name)}
                onUpdateSort={updateSort}
                defaultSort="name"
                defaultSortDirection="ascending"
                responsive
              />
            </TablePagination>
          </ScrollableTable>
        </>
      ) : (
        <EmptyState
          className="empty-state"
          image={<Icon name="private-key" className="empty-state-icon" />}
          title="No keys"
        >
          <p>This storage bucket does not contain any keys.</p>
          <p>
            <DocLink
              docPath="/howto/storage_buckets/#manage-storage-bucket-keys"
              hasExternalIcon
            >
              Learn how to manage storage bucket keys
            </DocLink>
          </p>
          <CreateStorageBucketKeyBtn />
        </EmptyState>
      )}
    </div>
  );
};

export default StorageBucketKeys;
