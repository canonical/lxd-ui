import type { FC } from "react";
import { useState } from "react";
import ItemName from "components/ItemName";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import classnames from "classnames";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ResourceLabel from "components/ResourceLabel";
import type { LxdPlacementGroup } from "types/placementGroup";
import { deletePlacementGroup } from "api/placement-groups";

interface Props {
  placementGroup: LxdPlacementGroup;
  project: string;
}

const DeletePlacementGroupBtn: FC<Props> = ({ placementGroup, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    deletePlacementGroup(placementGroup.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.placementGroups, project],
        });
        toastNotify.success(
          <>
            Placement group{" "}
            <ResourceLabel bold type="profile" value={placementGroup.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Placement group deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      onHoverText="Delete placement group"
      className={classnames("u-no-margin--bottom", {
        "has-icon": true,
      })}
      disabled={isLoading}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
        children: (
          <p>
            This will permanently delete placement group{" "}
            <ItemName item={placementGroup} bold />.
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeletePlacementGroupBtn;
