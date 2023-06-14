import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { useNotify } from "context/notify";
import { LxdOperation } from "types/operation";
import { cancelOperation } from "api/operations";

interface Props {
  operation: LxdOperation;
}

const CancelOperationBtn: FC<Props> = ({ operation }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);

  const handleCancel = () => {
    setLoading(true);
    cancelOperation(operation.id)
      .then(() => {
        notify.success("Operation cancelled");
      })
      .catch((e) => {
        notify.failure("Operation cancellation failed", e);
      })
      .finally(() => setLoading(false));
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
      cancelButtonLabel="No"
      confirmMessage="Are you sure you want to cancel the operation?"
      confirmButtonLabel="Yes, cancel operation"
      toggleCaption="Cancel"
      onConfirm={handleCancel}
      isDisabled={!operation.may_cancel}
    />
  );
};

export default CancelOperationBtn;
