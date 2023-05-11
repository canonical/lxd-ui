import React, { FC } from "react";
import {
  MainTableRow,
  Props as MainTableProps,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  Button,
  CheckboxInput,
  ContextualMenu,
  Icon,
  MainTable,
  Notification,
} from "@canonical/react-components";
import classnames from "classnames";

interface SelectableMainTableProps {
  totalCount: number;
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
  totalCount,
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

    row.columns = [
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

    row.className = classnames(row.className, {
      "selected-row": isRowSelected,
      "processing-row": isRowProcessing,
    });
    row.key = row.name;

    return row;
  });

  const selectionState = isSomeSelected
    ? [
        {
          className: "select-notification",
          key: "select-info",
          expanded: true,
          expandedContent: (
            <Notification
              borderless
              className="u-no-margin--bottom"
              title="Selection"
            >
              {isAllSelected ? (
                <>
                  {filteredNames.length === 1 ? (
                    <>
                      <b>1</b> {itemName} is selected.{" "}
                    </>
                  ) : (
                    <>
                      All <b>{filteredNames.length}</b> {itemName}s selected.{" "}
                    </>
                  )}
                  <Button
                    appearance="link"
                    className="u-no-margin--bottom u-no-padding--top"
                    onClick={selectNone}
                  >
                    Clear selection
                  </Button>
                </>
              ) : (
                <>
                  <b>{selectedNames.length}</b> {itemName}
                  {selectedNames.length > 1 && "s"} selected.{" "}
                  <Button
                    appearance="link"
                    className="u-no-margin--bottom u-no-padding--top"
                    onClick={selectAll}
                  >
                    Select all <b>{filteredNames.length}</b>{" "}
                    {filteredNames.length === totalCount
                      ? parentName
                      : "filtered"}{" "}
                    {itemName}s
                  </Button>
                </>
              )}
            </Notification>
          ),
        },
      ]
    : [];

  return (
    <MainTable
      expanding={true}
      headers={headersWithCheckbox}
      rows={[...selectionState, ...rowsWithCheckbox]}
      {...props}
    />
  );
};

export default SelectableMainTable;
