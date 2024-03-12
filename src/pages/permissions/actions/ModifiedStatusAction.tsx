import { Button, Icon } from "@canonical/react-components";
import { FC } from "react";
import { getClientOS } from "util/helpers";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  modifiedCount: number;
  onUndoChange: () => void;
  itemName: string;
  actionText?: string;
}

const ModifiedStatusAction: FC<Props> = ({
  modifiedCount,
  onUndoChange,
  itemName,
  actionText,
}) => {
  const controlKey =
    getClientOS(navigator.userAgent) === "macos" ? "\u2318" : "ctrl";

  return (
    <div className="modified-actions">
      <div className="modified-status">
        <Icon name="status-in-progress-small" />
        <span>{`${modifiedCount} ${pluralize(itemName, modifiedCount)} will be ${actionText ?? "modified"}`}</span>
      </div>
      <Button
        hasIcon
        className="u-no-margin--bottom"
        dense
        onClick={onUndoChange}
        title={`Undo most recent change (${controlKey}+z)`}
      >
        <Icon name="restart" />
        <span>{`Undo`}</span>
      </Button>
    </div>
  );
};

export default ModifiedStatusAction;
