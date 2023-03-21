import React from "react";
import {
  CheckboxInput,
  ContextualMenu,
  Icon,
} from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  className?: string;
  columns: string[];
  hidden: string[];
  setHidden: (columns: string[]) => void;
}

const TableColumnsSelect = ({
  className,
  columns,
  hidden,
  setHidden,
}: Props): JSX.Element => {
  const selectedCount = columns.length - hidden.length;

  const toggleHiddenColumn = (column: string): void => {
    if (hidden.includes(column)) {
      setHidden(hidden.filter((c) => c !== column));
    } else {
      setHidden([...hidden, column]);
    }
  };
  return (
    <ContextualMenu
      className={classnames(className, "configurable-table-toggle")}
      dropdownProps={{ "aria-label": "columns menu" }}
      position="right"
      toggleClassName="has-icon"
      toggleProps={{
        "aria-label": "Columns selection toggle",
      }}
      toggleLabel={<Icon name="settings" />}
      toggleAppearance="base"
      title="Columns"
    >
      <div className="table-column-select-list">
        <CheckboxInput
          checked={hidden.length === 0}
          indeterminate={selectedCount > 0 && selectedCount < columns.length}
          label={`${selectedCount} out of ${columns.length} selected`}
          onChange={() =>
            hidden.length > 0 ? setHidden([]) : setHidden(columns)
          }
        />
        <hr />
        {columns.map((column) => (
          <CheckboxInput
            aria-label={column}
            checked={!hidden.includes(column)}
            key={column}
            label={column}
            onChange={() => toggleHiddenColumn(column)}
          />
        ))}
      </div>
    </ContextualMenu>
  );
};

export default TableColumnsSelect;
