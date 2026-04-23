import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useImageRegistriesEntitlements } from "util/entitlements/images";
import type { LxdImageRegistry } from "types/image";
import usePanelParams from "util/usePanelParams";
import classnames from "classnames";
import { useIsScreenBelow } from "context/useIsScreenBelow";

interface Props {
  imageRegistry: LxdImageRegistry;
}

const EditImageRegistryButton: FC<Props> = ({ imageRegistry }) => {
  const { openEditImageRegistry } = usePanelParams();
  const { canEditImageRegistry } = useImageRegistriesEntitlements();
  const isSmallScreen = useIsScreenBelow();

  const disabledReason = () => {
    if (imageRegistry.builtin) {
      return "Built-in image registries cannot be edited";
    }
    if (!canEditImageRegistry(imageRegistry)) {
      return "You do not have permission to edit this image registry";
    }
    return undefined;
  };

  const isDisabled = disabledReason() !== undefined;

  return (
    <Button
      appearance="default"
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      disabled={isDisabled}
      type="button"
      hasIcon
      title={disabledReason() || "Edit registry"}
      onClick={() => {
        openEditImageRegistry(imageRegistry.name);
      }}
    >
      {!isSmallScreen && <Icon name="edit" />}
      <span>Edit Registry</span>
    </Button>
  );
};

export default EditImageRegistryButton;
