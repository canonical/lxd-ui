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
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import { LxdGroup, LxdIdentity } from "types/permissions";
import { updateGroupsForIdentity } from "api/permissions";

interface Props {
  idendity: LxdIdentity;
  group: LxdGroup;
  shouldExpand?: boolean;
}

const PermissionIdentityDeleteGroupBtn: FC<Props> = ({
  idendity,
  group,
  shouldExpand = false,
}) => {
  const isSmallScreen = useDeleteIcon();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    const newIdentityGroups = idendity.groups?.filter(
      (existingGroup) => existingGroup !== group.name,
    );
    setLoading(true);
    updateGroupsForIdentity(idendity, newIdentityGroups || [])
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return (
              query.queryKey[0] === queryKeys.identities ||
              query.queryKey[0] === queryKeys.lxdGroups
            );
          },
        });
        toastNotify.success(`${group.name} removed for ${idendity.name}.`);
      })
      .catch((e) => {
        notify.failure("Group deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm remove",
        children: (
          <p>
            This will permanently remove <ItemName item={group} bold /> for{" "}
            <ItemName item={idendity} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Remove group",
        onConfirm: handleDelete,
        message: "Remove group",
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
      {!isSmallScreen && shouldExpand && "Remove group"}
    </ConfirmationButton>
  );
};

export default PermissionIdentityDeleteGroupBtn;
