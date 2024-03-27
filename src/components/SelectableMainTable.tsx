import { FC, PointerEvent, useState } from "react";
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
import useEventListener from "@use-it/event-listener";

interface SelectableMainTableProps {
  filteredNames: string[];
  itemName: string;
  parentName: string;
  selectedNames: string[];
  setSelectedNames: (val: string[]) => void;
  processingNames: string[];
  rows: MainTableRow[];
  // NOTE: indeterminate names are only effective during initialisation of this component
  indeterminateNames?: string[];
  unSelectableNames?: Set<string>;
  onToggleRow?: (name: string, action: "select" | "unselect") => void;
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
  indeterminateNames,
  unSelectableNames,
  onToggleRow,
  ...props
}: Props) => {
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<number>();
  const isAllSelected =
    selectedNames.length === filteredNames.length && selectedNames.length > 0;
  const isSomeSelected = selectedNames.length > 0;

  const isCheckBoxTarget = (target: HTMLElement) => {
    return target.className === "p-checkbox__label";
  };

  // This is required to prevent default behaviour of text selection for the SHIFT + click mouse event
  useEventListener<"mousedown">("mousedown", (event) => {
    if (event.shiftKey && isCheckBoxTarget(event.target as HTMLElement)) {
      event.preventDefault();
    }
  });

  const selectAll = () => {
    setSelectedNames(filteredNames);
    setCurrentSelectedIndex(undefined);
  };

  const selectPage = () => {
    let selectableRows = rows;
    if (unSelectableNames) {
      selectableRows = rows.filter(
        (row) => !unSelectableNames.has(row.name || ""),
      );
    }
    setSelectedNames(selectableRows.map((row) => row.name ?? ""));
    setCurrentSelectedIndex(undefined);
  };

  const selectNone = () => {
    setSelectedNames([]);
    setCurrentSelectedIndex(undefined);
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

  const selectedNamesLookup = new Set(selectedNames);
  const processingNamesLookup = new Set(processingNames);
  const indeterminateNamesLookup = new Set(indeterminateNames);
  const rowsWithCheckbox = rows.map((row, rowIndex) => {
    const isRowSelected = selectedNamesLookup.has(row.name ?? "");
    const isRowProcessing = processingNamesLookup.has(row.name ?? "");
    const isRowIndeterminate = indeterminateNamesLookup.has(row.name ?? "");

    const toggleRow = (event: PointerEvent<HTMLInputElement>) => {
      if (onToggleRow) {
        const action = isRowSelected ? "unselect" : "select";
        onToggleRow(row.name || "", action);
        return;
      }

      if (
        event.nativeEvent.shiftKey &&
        currentSelectedIndex !== undefined &&
        !isRowSelected
      ) {
        const selectedNamesLookup = new Set(selectedNames);
        const newSelection = [...selectedNames];
        const startIndex = Math.min(rowIndex, currentSelectedIndex);
        const endIndex = Math.max(rowIndex, currentSelectedIndex);
        for (let i = startIndex; i < endIndex + 1; i++) {
          const rowName = rows[i].name;
          if (rowName && !selectedNamesLookup.has(rowName)) {
            newSelection.push(rowName);
          }
        }
        setSelectedNames(newSelection);
        setCurrentSelectedIndex(rowIndex);
        return;
      }

      const newSelection = isRowSelected
        ? selectedNames.filter((candidate) => candidate !== row.name)
        : [...selectedNames, row.name ?? ""];
      setSelectedNames(newSelection);

      if (isRowSelected) {
        setCurrentSelectedIndex(undefined);
      } else {
        setCurrentSelectedIndex(rowIndex);
      }
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
            disabled={
              isRowProcessing ||
              !row.name ||
              (unSelectableNames && unSelectableNames.has(row.name))
            }
            indeterminate={isRowIndeterminate}
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
