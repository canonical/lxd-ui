import type { FC } from "react";
import { useState } from "react";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import type { LxdProfile } from "types/profile";
import { useIsScreenBelow } from "context/useIsScreenBelow";
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
import { useProfileEntitlements } from "util/entitlements/profiles";

interface Props {
  profile: LxdProfile;
  project: string;
}

const DeleteProfileBtn: FC<Props> = ({ profile, project }) => {
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteProfile } = useProfileEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(profile.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, project],
        });
        navigate(`/ui/project/${encodeURIComponent(project)}/profiles`);
        toastNotify.success(
          <>
            Profile <ResourceLabel bold type="profile" value={profile.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Profile deletion failed", e);
      });
  };

  const isDefaultProfile = profile.name === "default";
  const getHoverText = () => {
    if (!canDeleteProfile(profile)) {
      return "You do not have permission to delete this profile";
    }

    if (isDefaultProfile) {
      return "The default profile cannot be deleted";
    }
    return "Delete profile";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      disabled={!canDeleteProfile(profile) || isDefaultProfile || isLoading}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
        children: (
          <p>
            This will permanently delete profile{" "}
            <ResourceLabel type="profile" value={profile.name} bold />.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>Delete</span>
    </ConfirmationButton>
  );
};

export default DeleteProfileBtn;
