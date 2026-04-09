import type { FC } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { deleteNetworkAcl } from "api/network-acls";
import { ROOT_PATH } from "util/rootPath";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useEventQueue } from "context/eventQueue";

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
  const location = useLocation();
  const isSmallScreen = useIsScreenBelow();
  const { canDeleteNetworkAcl } = useNetworkAclEntitlements();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.projects &&
        query.queryKey[1] === project &&
        query.queryKey[2] === queryKeys.networkAcls,
    });
  };

  const onSuccess = () => {
    invalidateCache();

    // Only navigate to the network ACLs list if we are still on the deleted ACL's detail page
    const aclDetailPath = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(networkAcl.name)}`;
    if (location.pathname.startsWith(aclDetailPath)) {
      navigate(
        `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acls`,
      );
    }

    toastNotify.success(
      <>
        Network ACL{" "}
        <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
        deleted.
      </>,
    );
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure(`Deletion of network ACL ${networkAcl.name} failed`, e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkAcl(networkAcl.name, project)
      .then((operation) => {
        if (hasStorageAndNetworkOperations) {
          toastNotify.info(
            <>
              Deletion of Network ACL{" "}
              <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
              has started.
            </>,
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              onSuccess();
            },
            (msg) => {
              onFailure(new Error(msg));
            },
          );
        } else {
          onSuccess();
        }
      })
      .catch((e) => {
        onFailure(e);
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
            <ResourceLabel type="network-acl" value={networkAcl.name} bold />?
            <br />
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
