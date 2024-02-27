import { FC, useState } from "react";
import { Button, Icon, useNotify } from "@canonical/react-components";
import usePortal from "react-useportal";
import { LxdIdentity } from "types/permissions";
import { updateItentityGroups } from "api/permissions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import PermissionIdentityEditGroupsModal from "./PermissionIdentityEditGroupsModal";

interface Props {
  identity: LxdIdentity;
  className?: string;
}

const PermissionIdentityEditGroupsBtn: FC<Props> = ({
  identity,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const handleClosePortal = () => {
    notify.clear();
    closePortal();
  };

  const handleAllocateGroupsToIdentity = (groups: string[]) => {
    setSubmitting(true);
    updateItentityGroups(identity, groups)
      .then(() => {
        toastNotify.success(`Successfully updated groups for ${identity.name}`);
        handleClosePortal();
      })
      .catch((e) => {
        notify.failure(`Failed to update groups for ${identity.name}`, e);
      })
      .finally(() => {
        setSubmitting(false);
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.identities ||
            query.queryKey[0] === queryKeys.permissionGroups,
        });
      });
  };

  return (
    <>
      {isOpen ? (
        <Portal>
          <PermissionIdentityEditGroupsModal
            identity={identity}
            onCancel={handleClosePortal}
            onFinish={(groups) => void handleAllocateGroupsToIdentity(groups)}
            submitting={submitting}
          />
        </Portal>
      ) : null}
      <Button
        appearance="base"
        hasIcon
        dense={true}
        onClick={openPortal}
        type="button"
        aria-label="Modify groups"
        title="Modify groups"
        className={className}
      >
        <Icon name="tag" />
      </Button>
    </>
  );
};

export default PermissionIdentityEditGroupsBtn;
