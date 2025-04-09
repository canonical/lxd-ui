import type { FC } from "react";
import ModifiedStatusAction from "./ModifiedStatusAction";
import { ActionButton, Button } from "@canonical/react-components";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  modifiedGroups: Set<string>;
  undoChange: () => void;
  closePanel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  actionText?: string;
  isEdit?: boolean;
}

const GroupSelectionActions: FC<Props> = ({
  modifiedGroups,
  undoChange,
  closePanel,
  onSubmit,
  loading,
  disabled,
  actionText,
  isEdit = false,
}) => {
  const confirmButtonText = modifiedGroups.size
    ? `Apply ${modifiedGroups.size} group ${pluralize("change", modifiedGroups.size)}`
    : "Modify groups";

  return (
    <>
      {isEdit && modifiedGroups.size ? (
        <ModifiedStatusAction
          modifiedCount={modifiedGroups.size}
          onUndoChange={undoChange}
          itemName="group"
          actionText={actionText}
        />
      ) : null}
      <Button
        appearance="base"
        onClick={closePanel}
        className="u-no-margin--bottom"
      >
        Cancel
      </Button>
      <ActionButton
        appearance="positive"
        onClick={onSubmit}
        className="u-no-margin--bottom"
        disabled={disabled}
        loading={loading}
      >
        {actionText ? "Confirm" : confirmButtonText}
      </ActionButton>
    </>
  );
};

export default GroupSelectionActions;
