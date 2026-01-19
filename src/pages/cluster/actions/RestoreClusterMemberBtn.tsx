import type { FC } from "react";
import { useState } from "react";
import { postClusterMemberState } from "api/cluster-members";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdClusterMember } from "types/cluster";
import {
  CheckboxInput,
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import classnames from "classnames";
import ResourceLabel from "components/ResourceLabel";
import { useMemberLoading } from "context/memberLoading";
import { useServerEntitlements } from "util/entitlements/server";
import ClusterMemberRichChip from "../ClusterMemberRichChip";

interface Props {
  member: LxdClusterMember;
  hasLabel?: boolean;
  className?: string;
  onClose?: () => void;
}

const RestoreClusterMemberBtn: FC<Props> = ({
  member,
  hasLabel = false,
  className,
  onClose,
}) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const queryClient = useQueryClient();
  const eventQueue = useEventQueue();
  const memberLoading = useMemberLoading();
  const loadingType = memberLoading.getType(member.server_name);
  const { canEditServerConfiguration } = useServerEntitlements();

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.cluster],
      predicate: (query) =>
        query.queryKey[0] === queryKeys.cluster ||
        query.queryKey[0] === queryKeys.operations,
    });
  };

  const handleSuccess = () => {
    toastNotify.success(
      <>
        Member <ClusterMemberRichChip clusterMember={member.server_name} />{" "}
        restore completed.
      </>,
    );
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure(
      "Member restore failed",
      new Error(msg),
      <ClusterMemberRichChip clusterMember={member.server_name} />,
    );
  };

  const handleRestore = () => {
    setLoading(true);
    postClusterMemberState(member, "restore", mode)
      .then((operation) => {
        toastNotify.info(
          <>
            Member <ClusterMemberRichChip clusterMember={member.server_name} />{" "}
            restore started.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          handleSuccess,
          handleFailure,
          invalidateCache,
        );
        onClose?.();
      })
      .catch((e) => {
        notify.failure("Member restore failed", e);
      })
      .finally(() => {
        setLoading(false);
        invalidateCache();
      });
  };

  const hasPermission = canEditServerConfiguration();

  const isDisabled =
    isLoading ||
    member.status !== "Evacuated" ||
    !!loadingType ||
    !hasPermission;

  return (
    <ConfirmationButton
      appearance={hasLabel ? "" : "base"}
      loading={isLoading || loadingType === "Restoring"}
      disabled={isDisabled}
      confirmationModalProps={{
        title: "Confirm restore",
        children: (
          <>
            <CheckboxInput
              label="Restore instances"
              onChange={() => {
                setMode(mode === "" ? "skip" : "");
              }}
              checked={mode === ""}
            />
            <p className="p-form-help-text">
              Chose whether to restore instances that were stopped or migrated
            </p>
            <p>
              This will restore cluster member{" "}
              <ResourceLabel
                type="cluster-member"
                value={member.server_name}
                bold
              />
              .
            </p>
          </>
        ),
        confirmButtonLabel: hasPermission
          ? "Restore cluster member"
          : "You do not have permission to restore cluster members",
        onConfirm: handleRestore,
        confirmButtonAppearance: "positive",
      }}
      shiftClickEnabled
      title="Restore cluster member"
      className={classnames(className, "has-icon u-no-margin--bottom")}
    >
      <Icon name="play" />
      {hasLabel && <span>Restore</span>}
    </ConfirmationButton>
  );
};

export default RestoreClusterMemberBtn;
