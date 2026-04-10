import type { FC } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import classnames from "classnames";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useImageRegistriesEntitlements } from "util/entitlements/images";
import { queryKeys } from "util/queryKeys";
import { ROOT_PATH } from "util/rootPath";
import type { LxdImageRegistry } from "types/image";
import { deleteImageRegistry } from "api/image-registries";

interface Props {
  imageRegistry: LxdImageRegistry;
}

const DeleteImageRegistryDeleteBtn: FC<Props> = ({ imageRegistry }) => {
  const isSmallScreen = useIsScreenBelow();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteImageRegistry } = useImageRegistriesEntitlements();

  const notifySuccess = (imageRegistryName: string) => {
    toastNotify.success(
      <>
        Image registry{" "}
        <ResourceLabel bold type="image-registry" value={imageRegistryName} />{" "}
        deleted.
      </>,
    );
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.imageRegistries],
    });
  };

  const onSuccess = () => {
    invalidateCache();

    // Only navigate to the image registries list if we are still on the deleted registry's detail page
    const registryDetailPath = `${ROOT_PATH}/ui/image-registry/${encodeURIComponent(imageRegistry.name)}`;
    if (location.pathname.startsWith(registryDetailPath)) {
      navigate(`${ROOT_PATH}/ui/image-registries`);
    }

    notifySuccess(imageRegistry.name);
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure(`Deleting image registry ${imageRegistry.name} failed`, e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteImageRegistry(imageRegistry.name).then(onSuccess).catch(onFailure);
  };

  const disabledReason = () => {
    if (imageRegistry.builtin) {
      return "Built-in image registries cannot be deleted";
    }
    if (!canDeleteImageRegistry(imageRegistry)) {
      return "You do not have permission to delete this image registry";
    }
    return undefined;
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete image registry{" "}
            <ResourceLabel
              type="image-registry"
              value={imageRegistry.name}
              bold
            />
            .
          </p>
        ),
        confirmButtonLabel: "Delete registry",
        onConfirm: handleDelete,
        message: "Delete image registry",
      }}
      appearance="default"
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={Boolean(disabledReason()) || isLoading}
      onHoverText={disabledReason()}
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>Delete registry</span>
    </ConfirmationButton>
  );
};

export default DeleteImageRegistryDeleteBtn;
