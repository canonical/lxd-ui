import { FC, useState } from "react";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import type { LxdProfile } from "types/profile";
import ItemName from "components/ItemName";
import { useSmallScreen } from "context/useSmallScreen";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLabel from "components/ResourceLabel";
import { useProfileEntitlements } from "util/entitlements/profiles";

interface Props {
  profile: LxdProfile;
  project: string;
  featuresProfiles: boolean;
}

const DeleteProfileBtn: FC<Props> = ({
  profile,
  project,
  featuresProfiles,
}) => {
  const isSmallScreen = useSmallScreen();
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
        navigate(`/ui/project/${project}/profiles`);
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

    if (!featuresProfiles) {
      return "Modifications are only available in the default project";
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
      disabled={
        !canDeleteProfile(profile) || isDefaultProfile || !featuresProfiles
      }
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
        children: (
          <p>
            This will permanently delete profile{" "}
            <ItemName item={profile} bold />.<br />
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
