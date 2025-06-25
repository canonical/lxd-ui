import type { FC } from "react";
import { useState } from "react";
import ItemName from "components/ItemName";
import { postClusterMemberState } from "api/cluster";
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
import ResourceLink from "components/ResourceLink";
import { useEventQueue } from "context/eventQueue";
import classnames from "classnames";

interface Props {
  member: LxdClusterMember;
  hasLabel?: boolean;
  className?: string;
}

const RestoreClusterMemberBtn: FC<Props> = ({
  member,
  hasLabel = false,
  className,
}) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const queryClient = useQueryClient();
  const eventQueue = useEventQueue();

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
        Member{" "}
        <ResourceLink
          type="cluster-member"
          value={member.server_name}
          to="/ui/cluster/members"
        />{" "}
        restore completed.
      </>,
    );
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure(
      "Member restore failed",
      new Error(msg),
      <ResourceLink
        type="cluster-member"
        value={member.server_name}
        to="/ui/cluster/members"
      />,
    );
  };

  const handleRestore = () => {
    setLoading(true);
    postClusterMemberState(member, "restore", mode)
      .then((operation) => {
        toastNotify.info(
          <>
            Member{" "}
            <ResourceLink
              to="/ui/cluster/members"
              type="cluster-member"
              value={member.server_name}
            />{" "}
            restore started.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          handleSuccess,
          handleFailure,
          invalidateCache,
        );
      })
      .catch((e) => notify.failure("Member restore failed", e))
      .finally(() => {
        setLoading(false);
        invalidateCache();
      });
  };

  return (
    <ConfirmationButton
      appearance={hasLabel ? "" : "base"}
      loading={isLoading}
      disabled={isLoading}
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
              <ItemName item={{ name: member.server_name }} bold />.
            </p>
          </>
        ),
        confirmButtonLabel: "Restore member",
        onConfirm: handleRestore,
        confirmButtonAppearance: "positive",
      }}
      shiftClickEnabled
      title="Restore cluster member"
      className={classnames(className, "has-icon u-no-margin--bottom")}
    >
      <Icon name="change-version" />
      {hasLabel && <span>Restore</span>}
    </ConfirmationButton>
  );
};

export default RestoreClusterMemberBtn;
