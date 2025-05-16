import type { FC } from "react";
import { useState } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import { deleteWarningBulk } from "api/warnings";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  warningIds: string[];
  canDeleteWarnings: boolean;
  onStart?: () => void;
  onFinish?: () => void;
}

const BulkDeleteWarningBtn: FC<Props> = ({
  warningIds,
  canDeleteWarnings,
  onStart,
  onFinish,
}) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    onStart?.();
    deleteWarningBulk(warningIds)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.warnings],
        });
        toastNotify.success(<>Warning deleted.</>);
      })
      .catch((e) => {
        toastNotify.failure("Warning deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        onFinish?.();
      });
  };

  const getHoverText = () => {
    if (!canDeleteWarnings) {
      return "You do not have permission to delete warnings";
    }
    return "Delete Warning";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance="default"
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete the warning.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "Delete",
      }}
      disabled={!canDeleteWarnings}
      shiftClickEnabled
      showShiftClickHint
      aria-label="delete"
    >
      <Icon name="delete" />
      <span>Delete {pluralize("warning", warningIds.length)}</span>
    </ConfirmationButton>
  );
};

export default BulkDeleteWarningBtn;
