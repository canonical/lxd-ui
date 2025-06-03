import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import type { LxdNetworkAcl } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useSmallScreen } from "context/useSmallScreen";
import classnames from "classnames";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { deleteNetworkAcl } from "api/network-acls";

interface Props {
  networkAcl: LxdNetworkAcl;
  project: string;
}

const DeleteNetworkAclBtn: FC<Props> = ({ networkAcl, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();
  const { canDeleteNetworkAcl } = useNetworkAclEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkAcl(networkAcl.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networkAcls,
        });
        navigate(`/ui/project/${project}/network-acls`);
        toastNotify.success(
          <>
            Network ACL{" "}
            <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("ACL deletion failed", e);
      });
  };

  const isUsed = (networkAcl.used_by?.length ?? 0) > 0;

  const getOnHoverText = () => {
    if (!canDeleteNetworkAcl(networkAcl)) {
      return "You do not have permission to delete this ACL";
    }

    if (isUsed) {
      return "Can not delete, ACL is currently in use";
    }

    return "";
  };

  return (
    <ConfirmationButton
      onHoverText={getOnHoverText()}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the ACL{" "}
            <ItemName item={networkAcl} bold />?<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={!canDeleteNetworkAcl(networkAcl) || isUsed || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>Delete ACL</span>
    </ConfirmationButton>
  );
};

export default DeleteNetworkAclBtn;
