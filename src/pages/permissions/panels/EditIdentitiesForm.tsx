import { Icon, SearchBox, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { queryKeys } from "util/queryKeys";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import { fetchIdentities } from "api/auth-identities";
import useSortTableData from "util/useSortTableData";
import { LxdIdentity } from "types/permissions";

export type FormIdentity = LxdIdentity & {
  isRemoved?: boolean;
  isAdded?: boolean;
};

interface Props {
  selected: FormIdentity[];
  setSelected: (list: FormIdentity[]) => void;
  groupName: string;
}

const EditIdentitiesForm: FC<Props> = ({
  selected,
  setSelected,
  groupName,
}) => {
  const notify = useNotify();
  const [filter, setFilter] = useState<string | null>(null);

  const { data: identities = [], error } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });

  if (error) {
    notify.failure("Loading details failed", error);
  }

  const nonTlsIdentities = identities.filter(
    (identity) => identity.authentication_method !== "tls",
  );

  const toggleRow = (id: string) => {
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
    { content: "Identity", sortKey: "name", role: "rowheader" },
    {
      content: "",
      role: "rowheader",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filteredIdentities = nonTlsIdentities.filter((identity) => {
    if (filter) {
      return identity.name.toLowerCase().includes(filter.toLowerCase());
    }

    return true;
  });

  const rows = filteredIdentities.map((identity) => {
    const clickRow = () => toggleRow(identity.id);
    const formIdentity = selected.find((id) => id.id === identity.id);
    const isModified = formIdentity?.isAdded || formIdentity?.isRemoved;

    return {
      name: identity.id,
      className: "u-row",
      columns: [
        {
          content: identity.name,
          role: "cell",
          "aria-label": "Identity",
          title: identity.name,
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
        name: identity.name.toLowerCase(),
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  return (
    <>
      <SearchBox onChange={(value) => setFilter(value)} />
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
          processingNames={[]}
          filteredNames={nonTlsIdentities.map((identity) => identity.id)}
          indeterminateNames={[]}
          onToggleRow={toggleRow}
          hideContextualMenu
        />
      </ScrollableTable>
    </>
  );
};

export default EditIdentitiesForm;
