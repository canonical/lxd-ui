import { FC, useState } from "react";
import ItemName from "components/ItemName";
import { postClusterMemberState } from "api/cluster";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdClusterMember } from "types/cluster";
import { ConfirmationButton, useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  member: LxdClusterMember;
}

const RestoreClusterMemberBtn: FC<Props> = ({ member }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRestore = () => {
    setLoading(true);
    postClusterMemberState(member, "restore")
      .then(() => {
        toastNotify.success(
          `Cluster member ${member.server_name} restore started.`,
        );
      })
      .catch((e) => notify.failure("Cluster member restore failed", e))
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster],
        });
      });
  };

  return (
    <ConfirmationButton
      appearance=""
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm restore",
        children: (
          <p>
            This will restore cluster member{" "}
            <ItemName item={{ name: member.server_name }} bold />.
          </p>
        ),
        confirmButtonLabel: "Restore",
        onConfirm: handleRestore,
        confirmButtonAppearance: "positive",
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <span>Restore</span>
    </ConfirmationButton>
  );
};

export default RestoreClusterMemberBtn;
