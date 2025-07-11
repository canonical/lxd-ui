import type { FC } from "react";
import { useState } from "react";
import ItemName from "components/ItemName";
import { postClusterMemberState } from "api/cluster";
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

interface Props {
  member: LxdClusterMember;
  hasLabel?: boolean;
  className?: string;
}

const EvacuateClusterMemberBtn: FC<Props> = ({
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
          to="/ui/cluster/groups"
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
        to="/ui/cluster/groups"
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
              to="/ui/cluster/groups"
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
      })
      .catch((e) => notify.failure("Member evacuation failed", e))
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
              <ItemName item={{ name: member.server_name }} bold />.
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
      <Icon name="change-version" />
      {hasLabel && <span>Evacuate</span>}
    </ConfirmationButton>
  );
};

export default EvacuateClusterMemberBtn;
