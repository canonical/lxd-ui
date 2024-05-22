import { DependencyList, FC, useState } from "react";
import PermissionGroupsFilter from "../PermissionGroupsFilter";
import ScrollableContainer from "components/ScrollableContainer";
import { LxdGroup } from "types/permissions";
import { EmptyState, Icon } from "@canonical/react-components";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";
import useSortTableData from "util/useSortTableData";

interface Props {
  groups: LxdGroup[];
  modifiedGroups: Set<string>;
  parentItemName: string;
  parentItems?: { name: string }[];
  selectedGroups: Set<string>;
  setSelectedGroups: (val: string[], isUnselectAll?: boolean) => void;
  indeterminateGroups?: Set<string>;
  toggleGroup?: (rowName: string) => void;
  scrollDependencies: DependencyList;
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
}) => {
  const [search, setSearch] = useState("");

  const headers = [
    {
      content: "Group name",
      sortKey: "name",
      className: "name",
      role: "rowheader",
    },
    {
      content: "Description",
      sortKey: "description",
      className: "description",
      role: "rowheader",
    },
    {
      content: "",
      role: "rowheader",
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
        : `${parentItemName} ${parentItems?.[0].name}`;
    const modifiedTitle = groupAdded
      ? `Group will be added to ${selectedParentsText}`
      : groupRemoved
        ? `Group will be removed from ${selectedParentsText}`
        : "";

    return {
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          role: "cell",
          className: "name u-truncate",
          "aria-label": "Name",
        },
        {
          content: <span>{group.description || ""}</span>,
          role: "cell",
          className: "description",
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
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  return (
    <ScrollableContainer
      dependencies={scrollDependencies}
      belowIds={["panel-footer"]}
      className="group-selection"
    >
      <PermissionGroupsFilter onChange={setSearch} value={search} />
      {groups.length ? (
        <ScrollableTable
          dependencies={[...scrollDependencies, search]}
          tableId="group-selection-table"
          belowIds={["panel-footer"]}
        >
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
            processingNames={[]}
            filteredNames={groups.map((group) => group.name)}
            indeterminateNames={Array.from(indeterminateGroups ?? new Set())}
            onToggleRow={toggleGroup}
            hideContextualMenu
          />
        </ScrollableTable>
      ) : (
        <EmptyState
          className="empty-state empty-state__full-width"
          image={<Icon name="user-group" className="empty-state-icon" />}
          title="No groups"
        >
          <p>No groups found.</p>
          <Link to={`/ui/permissions/groups`}>
            Create groups
            <Icon className="external-link-icon" name="external-link" />
          </Link>
        </EmptyState>
      )}
    </ScrollableContainer>
  );
};

export default GroupSelection;
