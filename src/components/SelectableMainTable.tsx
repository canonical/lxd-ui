import { FC } from "react";
import {
  MainTableRow,
  Props as MainTableProps,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  CheckboxInput,
  ContextualMenu,
  Icon,
  MainTable,
} from "@canonical/react-components";
import classnames from "classnames";

interface SelectableMainTableProps {
  filteredNames: string[];
  itemName: string;
  parentName: string;
  selectedNames: string[];
  setSelectedNames: (val: string[]) => void;
  processingNames: string[];
  rows: MainTableRow[];
}

type Props = SelectableMainTableProps & MainTableProps;

const SelectableMainTable: FC<Props> = ({
  filteredNames,
  itemName,
  parentName,
  selectedNames,
  setSelectedNames,
  processingNames,
  rows,
  headers,
  ...props
}: Props) => {
  const isAllSelected =
    selectedNames.length === filteredNames.length && selectedNames.length > 0;
  const isSomeSelected = selectedNames.length > 0;

  const selectAll = () => {
    setSelectedNames(filteredNames);
  };

  const selectPage = () => {
    setSelectedNames(rows.map((row) => row.name ?? ""));
  };

  const selectNone = () => {
    setSelectedNames([]);
  };

  const headersWithCheckbox = [
    {
      content: (
        <>
          <CheckboxInput
            label={<div className="u-off-screen">Select all</div>}
            labelClassName="multiselect-checkbox"
            checked={isAllSelected}
            indeterminate={isSomeSelected && !isAllSelected}
            onChange={isSomeSelected ? selectNone : selectPage}
          />
          <ContextualMenu
            className="select-context-menu"
            position="left"
            title="Multiselect"
            toggleAppearance="base"
            toggleClassName="has-icon u-no-margin--bottom"
            toggleLabel={<Icon name="chevron-down" />}
            toggleProps={{
              "aria-label": "multiselect rows",
            }}
            links={[
              {
                children: `Select all ${itemName}s on this page`,
                onClick: selectPage,
              },
              {
                children: `Select all ${parentName} ${itemName}s`,
                onClick: selectAll,
              },
            ]}
          />
        </>
      ),
      className: "select select-header",
      "aria-label": "select",
    },
    ...(headers ?? []),
  ];

  const rowsWithCheckbox = rows.map((row) => {
    const isRowSelected = selectedNames.includes(row.name ?? "");
    const isRowProcessing = processingNames.includes(row.name ?? "");

    const toggleRow = () => {
      const newSelection = isRowSelected
        ? selectedNames.filter((candidate) => candidate !== row.name)
        : [...selectedNames, row.name ?? ""];
      setSelectedNames(newSelection);
    };

    const columns = [
      {
        content: (
          <CheckboxInput
            label={
              <div className="u-off-screen">Select {row.name ?? "row"}</div>
            }
            labelClassName="u-no-margin--bottom"
            checked={isRowSelected}
            onChange={toggleRow}
            disabled={isRowProcessing || !row.name}
          />
        ),
        role: "rowheader",
        className: "select",
      },
      ...(row.columns ?? []),
    ];

    const className = classnames(row.className, {
      "selected-row": isRowSelected,
      "processing-row": isRowProcessing,
    });

    const key = row.name;

    return {
      ...row,
      className,
      key,
      columns,
    };
  });

  return (
    <MainTable
      expanding={true}
      headers={headersWithCheckbox}
      rows={[...rowsWithCheckbox]}
      {...props}
    />
  );
};

export default SelectableMainTable;
