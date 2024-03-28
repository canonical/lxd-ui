import {
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchIdentities } from "api/permissions";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import PermissionIdentityEditGroupsBtn from "./PermissionIdentityEditGroupsBtn";

interface Props {
  query: string;
  selectedNames: string[];
  onSelectNames: (names: string[]) => void;
}

const PermissionIdentities: FC<Props> = ({
  query,
  selectedNames,
  onSelectNames,
}) => {
  const notify = useNotify();

  const {
    data: identities = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: () => fetchIdentities(),
  });

  if (error) {
    notify.failure("Loading identities failed", error);
  }

  useEffect(() => {
    const validNames = new Set(identities?.map((identity) => identity.id));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      onSelectNames(validSelections);
    }
  }, [identities]);

  const headers = [
    { content: "ID", sortKey: "id" },
    { content: "Name", className: "name" },
    { content: "Auth method", sortKey: "authentication_method" },
    { content: "Type", sortKey: "type" },
    {
      content: "Groups",
      sortKey: "groups",
      className: "u-align--right",
    },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const filteredIdentities = identities.filter(
    (item) =>
      !query ||
      item.id.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.authentication_method.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase()),
  );

  const rows = filteredIdentities.map((identity) => {
    return {
      name: identity.id,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              className="u-truncate"
              title={`id: ${identity.id}`}
              to={`/ui/permissions/identity/${identity.authentication_method}/${encodeURIComponent(identity.id)}`}
            >
              {identity.id}
            </Link>
          ),
          role: "cell",
          "aria-label": "ID",
        },
        {
          content: (
            <span className="u-truncate" title={`name: ${identity.name}`}>
              {identity.name}
            </span>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: identity.authentication_method,
          role: "cell",
          "aria-label": "Auth method",
        },
        {
          content: identity.type,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: identity.groups?.length || 0,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Groups for this identity",
        },
        {
          className: "actions u-align--right",
          content: <PermissionIdentityEditGroupsBtn identity={identity} />,
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        id: identity.id,
        name: identity.name,
        authentication_method: identity.authentication_method,
        type: identity.type,
        groups: identity.groups?.length || 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader text="Loading identities" />;
  }

  return (
    <Row>
      <ScrollableTable
        dependencies={[identities]}
        tableId="identities-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="user"
          className="u-no-margin--top"
          aria-label="Table pagination control"
          description={
            selectedNames.length > 0 && (
              <SelectedTableNotification
                totalCount={identities.length ?? 0}
                itemName="user"
                parentName="system"
                selectedNames={selectedNames}
                setSelectedNames={onSelectNames}
                filteredNames={filteredIdentities.map((item) => item.id)}
              />
            )
          }
        >
          <MainTable
            id="identities-table"
            headers={headers}
            sortable
            className="identities-table"
            emptyStateMsg="No identities found matching this search"
            onUpdateSort={updateSort}
          />
        </TablePagination>
      </ScrollableTable>
    </Row>
  );
};

export default PermissionIdentities;
