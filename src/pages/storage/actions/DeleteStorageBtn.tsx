import React, { FC, useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteStoragePool } from "api/storage-pools";
import classnames from "classnames";
import ItemName from "components/ItemName";
import { useDeleteIcon } from "context/useDeleteIcon";
import { useNavigate } from "react-router-dom";
import { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";

interface Props {
  storage: LxdStoragePool;
  project: string;
  shouldExpand?: boolean;
}

const DeleteStorageBtn: FC<Props> = ({
  storage,
  project,
  shouldExpand = false,
}) => {
  const isSmallScreen = useDeleteIcon();
  const navigate = useNavigate();
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteStoragePool(storage.name, project)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.storage],
        });
        navigate(
          `/ui/project/${project}/storage`,
          notify.queue(notify.success(`Storage pool ${storage.name} deleted.`))
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Storage pool deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete storage{" "}
            <ItemName item={storage} bold />.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete storage",
        onConfirm: handleDelete,
        message: "Delete storage",
      }}
      appearance={!isSmallScreen && shouldExpand ? "default" : "base"}
      className={classnames("u-no-margin--bottom", {
        "is-dense": !shouldExpand,
        "has-icon": !isSmallScreen && shouldExpand,
      })}
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && shouldExpand ? undefined : <Icon name="delete" />}
      {!isSmallScreen && shouldExpand && "Delete"}
    </ConfirmationButton>
  );
};

export default DeleteStorageBtn;
