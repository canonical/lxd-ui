import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { useNotify } from "context/notify";
import { LxdOperation } from "types/operation";
import { cancelOperation } from "api/operations";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

interface Props {
  operation: LxdOperation;
  project: string;
}

const CancelOperationBtn: FC<Props> = ({ operation, project }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setLoading(true);
    cancelOperation(operation.id)
      .then(() => {
        notify.success("Operation cancelled");
      })
      .catch((e) => {
        notify.failure("Operation cancellation failed", e);
      })
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.operations, project],
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
      toggleAppearance=""
      isLoading={isLoading}
      title="Confirm cancel"
      cancelButtonLabel="Go back"
      confirmMessage="This will cancel the operation."
      confirmButtonLabel="Cancel operation"
      toggleCaption="Cancel"
      onConfirm={handleCancel}
      isDisabled={!operation.may_cancel}
    />
  );
};

export default CancelOperationBtn;
