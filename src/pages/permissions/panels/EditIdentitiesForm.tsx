import {
  Icon,
  ScrollableTable,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import type { FC } from "react";
import { useState } from "react";
import SelectableMainTable from "components/SelectableMainTable";
import useSortTableData from "util/useSortTableData";
import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import { isUnrestricted } from "util/helpers";
import { useIdentities } from "context/useIdentities";
import { useIdentityEntitlements } from "util/entitlements/identities";
import {
  getIdentityIdsForGroup,
  getIdentityName,
} from "util/permissionIdentities";

export type FormIdentity = LxdIdentity & {
  isRemoved?: boolean;
  isAdded?: boolean;
};

interface Props {
  selected: FormIdentity[];
  setSelected: (list: FormIdentity[]) => void;
  groupName: string;
  group?: LxdAuthGroup;
}

const EditIdentitiesForm: FC<Props> = ({
  selected,
  setSelected,
  groupName,
  group,
}) => {
  const notify = useNotify();
  const [filter, setFilter] = useState<string | null>(null);

  const { data: identities = [], error } = useIdentities();
  const { canEditIdentity } = useIdentityEntitlements();
  const restrictedIdentityNames = identities
    .filter((identity) => !canEditIdentity(identity))
    .map((identity) => identity.id);

  if (error) {
    notify.failure("Loading details failed", error);
  }

  const fineGrainedIdentities = identities.filter(
    (identity) => !isUnrestricted(identity),
  );

  const preselectedIdentities = new Set(getIdentityIdsForGroup(group));
  const hasPreselectedIdentities = preselectedIdentities.size > 0;

  const toggleRow = (id: string) => {
    if (restrictedIdentityNames.includes(id)) {
      return;
    }

    const existing = selected.find((identity) => identity.id === id);
    if (existing) {
      const filtered = selected.filter((identity) => identity.id !== id);
      const newEntry = {
        ...existing,
        isAdded: !existing.isAdded,
        isRemoved: !existing.isRemoved,
      };
      const wasInGroup = existing.groups?.includes(groupName);
      const excludeEntry = newEntry.isRemoved && !wasInGroup;
      if (excludeEntry) {
        setSelected(filtered);
        return;
      }

      newEntry.isAdded = !wasInGroup;
      setSelected([...filtered, newEntry]);
    } else {
      const addMe = identities.find((identity) => identity.id === id);
      if (!addMe) {
        notify.failure("Selection failed", new Error("Identity not found"));
        return;
      }
      setSelected([...selected, { ...addMe, isAdded: true, isRemoved: false }]);
    }
  };

  const bulkSelect = (names: string[]) => {
    // select none
    if (names.length === 0) {
      const updated: FormIdentity[] = [];
      selected.forEach((identity) => {
        if (identity.groups?.includes(groupName)) {
          updated.push({ ...identity, isAdded: false, isRemoved: true });
        }
      });
      setSelected(updated);
      return;
    }

    // select all
    const updated: FormIdentity[] = identities
      .filter((identity) => names.includes(identity.id))
      .map((identity) => {
        return {
          ...identity,
          isAdded: !identity.groups?.includes(groupName),
          isRemoved: false,
        };
      });
    setSelected(updated);
  };

  const headers = [
    { content: "Identity", sortKey: "name" },
    {
      content: "",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filteredIdentities = fineGrainedIdentities.filter((identity) => {
    if (filter) {
      const name = getIdentityName(identity);
      return name.toLowerCase().includes(filter.toLowerCase());
    }

    return true;
  });

  const rows = filteredIdentities.map((identity) => {
    const clickRow = () => {
      toggleRow(identity.id);
    };
    const formIdentity = selected.find((id) => id.id === identity.id);
    const isModified = formIdentity?.isAdded || formIdentity?.isRemoved;
    const name = getIdentityName(identity);

    return {
      key: identity.id,
      name: identity.id,
      className: "u-row",
      columns: [
        {
          content: name,
          role: "rowheader",
          "aria-label": "Identity",
          title: canEditIdentity(identity)
            ? name
            : "You do not have permission to allocate this identity to the group",
          onClick: clickRow,
          className: "clickable-cell",
        },
        {
          content: isModified && <Icon name="status-in-progress-small" />,
          role: "cell",
          "aria-label": "Modified status",
          className: "modified-status u-align--right",
        },
      ],
      sortData: {
        name: name.toLowerCase(),
        isPreselected: preselectedIdentities.has(identity.id),
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: hasPreselectedIdentities ? "isPreselected" : "name",
    defaultSortDirection: hasPreselectedIdentities ? "descending" : "ascending",
  });

  return (
    <>
      <SearchBox
        onChange={(value) => {
          setFilter(value);
        }}
      />
      <ScrollableTable
        dependencies={[identities, selected, notify.notification]}
        tableId="group-identities-table"
        belowIds={["panel-footer"]}
      >
        <SelectableMainTable
          id="group-identities-table"
          headers={headers}
          rows={sortedRows}
          sortable
          emptyStateMsg="No identities found"
          itemName="identity"
          parentName="server"
          selectedNames={selected
            .filter((id) => !id.isRemoved)
            .map((identity) => identity.id)}
          setSelectedNames={bulkSelect}
          disabledNames={restrictedIdentityNames}
          filteredNames={fineGrainedIdentities.map((identity) => identity.id)}
          indeterminateNames={[]}
          onToggleRow={toggleRow}
          hideContextualMenu
          disableSelectAll={!!restrictedIdentityNames.length}
        />
      </ScrollableTable>
    </>
  );
};

export default EditIdentitiesForm;
