import type { FC } from "react";
import { useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { deleteWarningBulk } from "api/warnings";
import { pluralize } from "util/instanceBulkActions";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  warningIds: string[];
  onStart?: () => void;
  onFinish?: () => void;
}

const BulkDeleteWarningBtn: FC<Props> = ({ warningIds, onStart, onFinish }) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditServerConfiguration } = useServerEntitlements();
  const canDeleteWarnings = canEditServerConfiguration();

  const handleDelete = () => {
    setLoading(true);
    onStart?.();
    deleteWarningBulk(warningIds)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.warnings],
        });
        toastNotify.success(
          <>{pluralize("Warning", warningIds.length)} deleted.</>,
        );
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
            This will permanently delete{" "}
            <strong>
              {warningIds.length} {pluralize("warning", warningIds.length)}
            </strong>
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "Delete",
      }}
      disabled={!canDeleteWarnings || isLoading}
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
