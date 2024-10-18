import { FC } from "react";
import { Button, MainTable } from "@canonical/react-components";
import ScrollableTable from "components/ScrollableTable";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import classnames from "classnames";

interface Props {
  onSelect: (pool: string) => void;
  disablePool?: {
    name: string;
    reason: string;
  };
}

const StoragePoolSelectTable: FC<Props> = ({ onSelect, disablePool }) => {
  const { data: pools = [], isLoading } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(),
  });

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver" },
    { content: "Status", sortKey: "status" },
    { content: "Size", className: "size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = pools.map((pool) => {
    const disableReason = disablePool?.name === pool.name && disablePool.reason;
    const selectPool = () => {
      if (disableReason) {
        return;
      }
      onSelect(pool.name);
    };

    return {
      className: classnames("u-row", {
        "u-text--muted": disableReason,
        "u-row--disabled": disableReason,
      }),
      columns: [
        {
          content: (
            <div className="u-truncate migrate-instance-name" title={pool.name}>
              {pool.name}
            </div>
          ),
          role: "cell",
          "aria-label": "Name",
          onClick: selectPool,
        },
        {
          content: pool.driver,
          role: "cell",
          "aria-label": "Driver",
          onClick: selectPool,
        },
        {
          content: pool.status,
          role: "cell",
          "aria-label": "Status",
          onClick: selectPool,
        },
        {
          content: <StoragePoolSize pool={pool} />,
          role: "cell",
          "aria-label": "Size",
          onClick: selectPool,
          className: "size",
        },
        {
          content: (
            <Button
              onClick={selectPool}
              dense
              title={disableReason}
              disabled={Boolean(disableReason)}
            >
              Select
            </Button>
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
          onClick: selectPool,
        },
      ],
      sortData: {
        name: pool.name.toLowerCase(),
        driver: pool.driver,
        status: pool.status,
      },
    };
  });

  return (
    <div className="migrate-instance-table u-selectable-table-rows">
      <ScrollableTable
        dependencies={[pools]}
        tableId="migrate-instance-table"
        belowIds={["status-bar", "migrate-instance-actions"]}
      >
        <MainTable
          id="migrate-instance-table"
          headers={headers}
          rows={rows}
          sortable
          className="u-table-layout--auto storage-pools"
          emptyStateMsg={
            isLoading
              ? "Loading storage pools..."
              : "No storage pools available"
          }
        />
      </ScrollableTable>
    </div>
  );
};

export default StoragePoolSelectTable;
