import { ReactElement } from "react";
import {
  CheckboxInput,
  ContextualMenu,
  Icon,
  Tooltip,
} from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  className?: string;
  columns: string[];
  hidden: string[];
  sizeHidden: string[];
  setHidden: (columns: string[]) => void;
}

const TableColumnsSelect = ({
  className,
  columns,
  hidden,
  sizeHidden,
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

  const wrapTooltip = (element: ReactElement, column: string): ReactElement => {
    if (!sizeHidden.includes(column)) return element;

    return (
      <Tooltip
        message={
          <>
            Screen is too narrow to fit the column.
            <br />
            Disable columns above or use a bigger screen.
          </>
        }
        position="left"
      >
        {element}
      </Tooltip>
    );
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
          label={`${selectedCount} out of ${columns.length} columns selected`}
          onChange={() =>
            hidden.length > 0 ? setHidden([]) : setHidden(columns)
          }
        />
        <hr />
        {columns.map((column) => (
          <div key={column}>
            {wrapTooltip(
              <CheckboxInput
                aria-label={column}
                checked={!hidden.includes(column)}
                label={column}
                onChange={() => toggleHiddenColumn(column)}
                disabled={sizeHidden.includes(column)}
              />,
              column,
            )}
          </div>
        ))}
      </div>
    </ContextualMenu>
  );
};

export default TableColumnsSelect;
