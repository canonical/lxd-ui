import type { FC } from "react";
import { pluralize } from "util/instanceBulkActions";
import type { ConfirmationButtonProps } from "@canonical/react-components";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  entities: unknown[];
  deletableEntities: unknown[];
  entityType: string;
  onDelete: () => void;
  disabledReason?: string;
  bulkDeleteBreakdown?: string[];
  confirmationButtonProps?: Partial<ConfirmationButtonProps>;
  buttonLabel?: React.ReactNode;
  className?: string;
}

const BulkDeleteButton: FC<Props> = ({
  entities,
  deletableEntities,
  disabledReason,
  entityType,
  bulkDeleteBreakdown,
  confirmationButtonProps,
  onDelete,
  buttonLabel = "Delete",
  className,
}) => {
  const totalCount = entities.length;
  const deleteCount = deletableEntities.length;

  const breakdown =
    bulkDeleteBreakdown?.map((action) => {
      return (
        <li key={action} className="p-list__item">
          - {action}
        </li>
      );
    }) || [];

  const modalContent = (
    <>
      {breakdown.length > 0 && (
        <>
          <p>
            <b>{totalCount}</b> {pluralize(entityType, entities.length)}{" "}
            selected:
          </p>
          <ul className="p-list">{breakdown}</ul>
        </>
      )}
      <p className="u-no-padding--top">
        This will permanently delete <b>{deleteCount}</b>{" "}
        {pluralize(entityType, deleteCount)}.{"\n"}This action cannot be undone,
        and can result in data loss.
      </p>
    </>
  );

  return (
    <ConfirmationButton
      className={classnames("has-icon", className)}
      onHoverText={
        disabledReason ?? `Delete ${pluralize(entityType, entities.length)}`
      }
      disabled={deleteCount === 0 || !!disabledReason}
      shiftClickEnabled
      showShiftClickHint
      {...confirmationButtonProps}
      confirmationModalProps={{
        title: "Confirm delete",
        children: modalContent,
        confirmButtonLabel: "Delete",
        onConfirm: onDelete,
      }}
    >
      <Icon name="delete" />
      <span>{buttonLabel}</span>
    </ConfirmationButton>
  );
};

export default BulkDeleteButton;
