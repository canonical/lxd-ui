import { FC, useState } from "react";
import { Button, Icon, useNotify } from "@canonical/react-components";
import usePortal from "react-useportal";
import { LxdGroup, LxdIdentity } from "types/permissions";
import PermissionGroupEditIdentitiesModal from "./PermissionGroupEditIdentitiesModal";
import { updateIdentitiesForGroup } from "api/permissions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  group: LxdGroup;
  className?: string;
}

const PermissionGroupEditIdentitiesBtn: FC<Props> = ({ className, group }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const handleClosePortal = () => {
    notify.clear();
    closePortal();
  };

  const handleAllocateIdentitiesToGroup = (identities: LxdIdentity[]) => {
    setSubmitting(true);
    updateIdentitiesForGroup(identities, group)
      .then(() => {
        toastNotify.success(
          `Successfully updated identities for ${group.name}`,
        );
        handleClosePortal();
      })
      .catch((e) => {
        notify.failure(`Failed to update identities for ${group.name}`, e);
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
          <PermissionGroupEditIdentitiesModal
            group={group}
            onCancel={handleClosePortal}
            onFinish={(identities) =>
              void handleAllocateIdentitiesToGroup(identities)
            }
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
        aria-label="Add identities to group"
        title="Add identities to group"
        className={className}
      >
        <Icon name="user-group" />
      </Button>
    </>
  );
};

export default PermissionGroupEditIdentitiesBtn;
