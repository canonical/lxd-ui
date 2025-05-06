import type { FC } from "react";
import { useState } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import type { LxdWarning } from "types/warning";
import { deleteWarning } from "api/warnings";
import { useWarningEntitlements } from "util/entitlements/warnings";

interface Props {
  warning: LxdWarning;
}

const DeleteWarningBtn: FC<Props> = ({ warning }) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canDeleteWarning } = useWarningEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteWarning(warning)
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
      });
  };

  const getHoverText = () => {
    if (!canDeleteWarning(warning)) {
      return "You do not have permission to delete this warning";
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
      disabled={!canDeleteWarning(warning)}
      shiftClickEnabled
      showShiftClickHint
      aria-label="delete"
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteWarningBtn;
