import { FC, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { LxdGroup } from "types/permissions";
import DeleteGroupModal from "./DeleteGroupModal";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  groups: LxdGroup[];
  onDelete: () => void;
  className?: string;
}

const BulkDeleteGroupsBtn: FC<Props> = ({ groups, className, onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirmDelete = () => {
    setConfirming(true);
  };

  const handleCloseConfirm = () => {
    onDelete();
    setConfirming(false);
  };

  return (
    <>
      <Button
        onClick={handleConfirmDelete}
        aria-label="Delete groups"
        title="Delete groups"
        className={className}
        appearance="negative"
        hasIcon
      >
        <Icon name="delete" light />
        <span>{`Delete ${groups.length} ${pluralize("group", groups.length)}`}</span>
      </Button>
      {confirming && (
        <DeleteGroupModal groups={groups} close={handleCloseConfirm} />
      )}
    </>
  );
};

export default BulkDeleteGroupsBtn;
