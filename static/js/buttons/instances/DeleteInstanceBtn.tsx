import React, { FC, useState } from "react";
import { deleteInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import { Button } from "@canonical/react-components";

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
    <Button
      dense
      onClick={handleDelete}
      disabled={isLoading || instance.status !== "Stopped"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--delete"
        }
      >
        Delete
      </i>
    </Button>
  );
};

export default DeleteInstanceBtn;
