import type { FC } from "react";
import { useState } from "react";
import { postClusterMemberState } from "api/cluster-members";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdClusterMember } from "types/cluster";
import {
  ConfirmationButton,
  Icon,
  Select,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { useEventQueue } from "context/eventQueue";
import classnames from "classnames";
import ResourceLabel from "components/ResourceLabel";
import { useMemberLoading } from "context/memberLoading";

interface Props {
  member: LxdClusterMember;
  hasLabel?: boolean;
  className?: string;
  onClose?: () => void;
}

const EvacuateClusterMemberBtn: FC<Props> = ({
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
          to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
        />{" "}
        evacuation completed.
      </>,
    );
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure(
      "Member evacuation failed",
      new Error(msg),
      <ResourceLink
        type="cluster-member"
        value={member.server_name}
        to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
      />,
    );
  };

  const handleEvacuate = () => {
    setLoading(true);
    postClusterMemberState(member, "evacuate", mode)
      .then((operation) => {
        toastNotify.info(
          <>
            Member{" "}
            <ResourceLink
              type="cluster-member"
              value={member.server_name}
              to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
            />{" "}
            evacuation started.
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
        notify.failure("Member evacuation failed", e);
      })
      .finally(() => {
        setLoading(false);
        invalidateCache();
      });
  };

  return (
    <ConfirmationButton
      appearance={hasLabel ? "" : "base"}
      loading={isLoading || loadingType === "Evacuating"}
      disabled={isLoading || member.status !== "Online" || !!loadingType}
      confirmationModalProps={{
        title: "Confirm evacuation",
        children: (
          <>
            <Select
              label="Evacuation action"
              options={[
                { label: "Auto", value: "" },
                {
                  label: "Stop all instances",
                  value: "stop",
                },
                {
                  label: "Migrate instances to other members",
                  value: "migrate",
                },
                {
                  label: "Live migrate instances to other members",
                  value: "live-migrate",
                },
              ]}
              help="Chose what to do with instances on this member."
              onChange={(e) => {
                setMode(e.target.value);
              }}
              value={mode}
            />
            <p>
              This will evacuate cluster member{" "}
              <ResourceLabel
                type="cluster-member"
                value={member.server_name}
                bold
              />
              .
            </p>
          </>
        ),
        confirmButtonLabel: "Evacuate member",
        onConfirm: handleEvacuate,
      }}
      shiftClickEnabled
      title="Evacuate cluster member"
      className={classnames(className, "has-icon u-no-margin--bottom")}
    >
      <Icon name="stop" />
      {hasLabel && <span>Evacuate</span>}
    </ConfirmationButton>
  );
};

export default EvacuateClusterMemberBtn;
