import type { FC } from "react";
import { useState } from "react";
import type { LxdOperation } from "types/operation";
import { cancelOperation } from "api/operations";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";

interface Props {
  operation: LxdOperation;
  project?: string;
}

const CancelOperationBtn: FC<Props> = ({ operation, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setLoading(true);
    cancelOperation(operation.id)
      .then(() => {
        toastNotify.success(`Operation ${operation.description} cancelled`);
      })
      .catch((e) => {
        notify.failure("Operation cancellation failed", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: project
            ? [queryKeys.operations, project]
            : [queryKeys.operations],
        });
      });
  };

  return operation.status !== "Running" ? null : (
    <ConfirmationButton
      onHoverText={
        operation.may_cancel
          ? "Cancel operation"
          : "Cannot cancel operation at this stage"
      }
      className="u-no-margin--bottom"
      loading={isLoading}
      disabled={!operation.may_cancel || isLoading}
      confirmationModalProps={{
        title: "Confirm cancel",
        children: <p>This will cancel the operation.</p>,
        confirmButtonLabel: "Cancel operation",
        onConfirm: handleCancel,
        cancelButtonLabel: "Go back",
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <span>Cancel</span>
    </ConfirmationButton>
  );
};

export default CancelOperationBtn;
