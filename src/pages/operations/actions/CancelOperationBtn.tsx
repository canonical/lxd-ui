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
        notify.success(`Operation cancelled.`);
      })
      .catch((e) => {
        notify.failure("Operation cancellation failed", e);
      })
      .finally(() => setLoading(false));
  };

  return (
    <ConfirmationButton
      onHoverText="Cancel operation"
      toggleAppearance=""
      isLoading={isLoading}
      title="Confirm cancel"
      confirmMessage={<>Are you sure you want to cancel the operation?</>}
      confirmButtonLabel="Cancel"
      toggleCaption="Cancel"
      onConfirm={handleCancel}
      isDisabled={operation.status !== "Running"}
      isDense={false}
    />
  );
};

export default CancelOperationBtn;
