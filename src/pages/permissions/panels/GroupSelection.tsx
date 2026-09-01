import { useState, type DependencyList, type FC } from "react";
import {
  EmptyState,
  Icon,
  ScrollableContainer,
  ScrollableTable,
} from "@canonical/react-components";
import SelectableMainTable from "components/SelectableMainTable";
import PermissionGroupsFilter from "../PermissionGroupsFilter";
import { Link } from "react-router-dom";
import { pluralize } from "util/helpers";
import useSortTableData from "util/useSortTableData";
import { ROOT_PATH } from "util/rootPath";
import classnames from "classnames";
import type { LxdAuthGroup } from "types/permissions";
import DsIcon from "components/DsIcon";

interface Props {
  groups: LxdAuthGroup[];
  modifiedGroups: Set<string>;
  parentItemName: string;
  parentItems?: { name: string }[];
  selectedGroups: Set<string>;
  setSelectedGroups: (val: string[], isUnselectAll?: boolean) => void;
  indeterminateGroups?: Set<string>;
  toggleGroup: (rowName: string) => void;
  scrollDependencies: DependencyList;
  preselectedGroups?: Set<string>;
  belowIds?: string[];
  disabled?: boolean;
  hasScrollableTable?: boolean;
}

const GroupSelection: FC<Props> = ({
  groups,
  modifiedGroups,
  parentItemName,
  parentItems,
  selectedGroups,
  indeterminateGroups,
  setSelectedGroups,
  toggleGroup,
  scrollDependencies,
  preselectedGroups,
  belowIds = [],
  disabled = false,
  hasScrollableTable = true,
}) => {
  const [search, setSearch] = useState("");

  const headers = [
    {
      content: "Group",
      sortKey: "name",
      className: "name",
    },
    {
      content: "Description",
      sortKey: "description",
      className: "description",
    },
    {
      content: "",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filteredGroups = groups.filter((group) => {
    return group.name.toLowerCase().includes(search) || !search;
  });

  const rows = filteredGroups.map((group) => {
    const groupAdded =
      selectedGroups.has(group.name) && modifiedGroups.has(group.name);
    const groupRemoved =
      !selectedGroups.has(group.name) && modifiedGroups.has(group.name);

    const selectedParentsText =
      (parentItems?.length || 0) > 1
        ? `all selected ${pluralize(parentItemName, 2)}`
        : `${parentItemName} ${parentItems?.[0]?.name}`;
    const modifiedTitle = groupAdded
      ? `Group will be added to ${selectedParentsText}`
      : groupRemoved
        ? `Group will be removed from ${selectedParentsText}`
        : "";

    const toggleRow = () => {
      if (!disabled) {
        toggleGroup(group.name);
      }
    };

    return {
      key: group.name,
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          title: group.name,
          onClick: toggleRow,
          role: "rowheader",
          className: classnames("name u-truncate", {
            "clickable-cell": !disabled,
          }),
          "aria-label": "Name",
        },
        {
          content: <span>{group.description || ""}</span>,
          onClick: toggleRow,
          role: "cell",
          className: classnames("description", {
            "clickable-cell": !disabled,
          }),
          "aria-label": "Description",
          title: group.description,
        },
        {
          content: modifiedGroups.has(group.name) && (
            <Icon name="status-in-progress-small" />
          ),
          role: "cell",
          "aria-label": "Modified status",
          className: "modified-status u-align--right",
          title: parentItemName ? modifiedTitle : undefined,
        },
      ],
      sortData: {
        name: group.name.toLowerCase(),
        description: group.description.toLowerCase(),
        isPreselected: preselectedGroups?.has(group.name),
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: preselectedGroups ? "isPreselected" : "name",
    defaultSortDirection: preselectedGroups ? "descending" : "ascending",
  });

  const table = (
    <SelectableMainTable
      id="group-selection-table"
      className="group-selection-table"
      headers={headers}
      rows={sortedRows}
      sortable
      emptyStateMsg="No groups found"
      itemName="group"
      parentName=""
      selectedNames={Array.from(selectedGroups)}
      setSelectedNames={setSelectedGroups}
      disabledNames={[]}
      filteredNames={groups.map((group) => group.name)}
      indeterminateNames={Array.from(indeterminateGroups ?? new Set())}
      onToggleRow={toggleGroup}
      hideContextualMenu
      disableSelect={disabled}
    />
  );

  return (
    <div className="group-selection">
      {groups.length > 5 && (
        <PermissionGroupsFilter onChange={setSearch} value={search} />
      )}
      {groups.length ? (
        hasScrollableTable ? (
          <ScrollableContainer
            dependencies={scrollDependencies}
            belowIds={["panel-footer", ...belowIds]}
          >
            <ScrollableTable
              dependencies={[...scrollDependencies, search]}
              tableId="group-selection-table"
              belowIds={["panel-footer", ...belowIds]}
            >
              {table}
            </ScrollableTable>
          </ScrollableContainer>
        ) : (
          table
        )
      ) : (
        <EmptyState
          className="empty-state empty-state__full-width"
          image={<DsIcon icon="user-group" className="empty-state-icon" />}
          title="No groups found"
        >
          <p>
            Groups are an easy way to manage the structured assignment of
            permissions.
          </p>
          <Link to={`${ROOT_PATH}/ui/permissions/groups?panel=create-groups`}>
            Create group
            <DsIcon className="external-link-icon" icon="external-link" />
          </Link>
        </EmptyState>
      )}
    </div>
  );
};

export default GroupSelection;
