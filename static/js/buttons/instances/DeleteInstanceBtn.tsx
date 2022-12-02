import React, { FC, useState } from "react";
import { deleteInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";

type Props = {
  instance: LxdInstance;
  notify: NotificationHelper;
};

const DeleteInstanceBtn: FC<Props> = ({ instance, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} deleted.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance delete.", e);
      });
  };

  return (
    <ConfirmationButton
      isLoading={isLoading}
      iconClass="p-icon--delete"
      title="Confirm delete"
      confirmationMessage={`Are you sure you want to delete instance "${instance.name}"?
                            This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onPositive={handleDelete}
      isDisabled={isLoading || instance.status !== "Stopped"}
    />
  );
};

export default DeleteInstanceBtn;
