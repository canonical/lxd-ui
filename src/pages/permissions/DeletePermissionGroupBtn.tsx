import { FC, useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import classnames from "classnames";
import ItemName from "components/ItemName";
import { useDeleteIcon } from "context/useDeleteIcon";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import { IdpGroup, LxdGroup } from "types/permissions";
import { deleteIdpGroup, deletePermissionGroup } from "api/permissions";

interface Props {
  group: LxdGroup | IdpGroup;
  shouldExpand?: boolean;
  groupType?: "lxd-groups" | "idp-groups";
}

const DeletePermissionGroupBtn: FC<Props> = ({
  group,
  shouldExpand = false,
  groupType = "lxd-groups",
}) => {
  const isSmallScreen = useDeleteIcon();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const queryKey =
    groupType === "lxd-groups"
      ? queryKeys.permissionGroups
      : queryKeys.idpGroups;

  const handleDelete = () => {
    setLoading(true);
    const mutation =
      groupType === "lxd-groups" ? deletePermissionGroup : deleteIdpGroup;

    mutation(group.name)
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKey,
        });
        navigate(`/ui/permissions/${groupType}`);
        toastNotify.success(`Group ${group.name} deleted.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Group deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete the group{" "}
            <ItemName item={group} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete group",
        onConfirm: handleDelete,
        message: "Delete group",
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
      {!isSmallScreen && shouldExpand && "Delete group"}
    </ConfirmationButton>
  );
};

export default DeletePermissionGroupBtn;
