import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  totalCount: number;
  filteredNames: string[];
  itemName: string;
  parentName?: string;
  selectedNames: string[];
  setSelectedNames: (val: string[]) => void;
  hideActions?: boolean;
}

const SelectedTableNotification: FC<Props> = ({
  totalCount,
  filteredNames,
  itemName,
  parentName,
  selectedNames,
  setSelectedNames,
  hideActions,
}: Props) => {
  const isAllSelected = selectedNames.length === filteredNames.length;

  const selectAll = () => {
    setSelectedNames(filteredNames);
  };

  const selectNone = () => {
    setSelectedNames([]);
  };

  return (
    <div>
      {isAllSelected ? (
        <>
          {filteredNames.length === 1 ? (
            <>
              <b>1</b> {itemName} is selected.{" "}
            </>
          ) : (
            <>
              All <b>{filteredNames.length}</b>{" "}
              {pluralize(itemName, filteredNames.length)} selected.{" "}
            </>
          )}
          {!hideActions && (
            <Button
              appearance="link"
              className="u-no-margin--bottom u-no-padding--top"
              onClick={selectNone}
            >
              Clear selection
            </Button>
          )}
        </>
      ) : (
        <>
          <b>{selectedNames.length}</b>{" "}
          {pluralize(itemName, selectedNames.length)} selected.{" "}
          {!hideActions && (
            <Button
              appearance="link"
              className="u-no-margin--bottom u-no-padding--top"
              onClick={selectAll}
            >
              Select all <b>{filteredNames.length}</b>{" "}
              {filteredNames.length === totalCount
                ? `${pluralize(itemName, filteredNames.length)} ${parentName ? `in ${parentName}` : ""}`
                : `filtered ${pluralize(itemName, filteredNames.length)}`}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SelectedTableNotification;
