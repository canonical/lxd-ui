import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useImageRegistriesEntitlements } from "util/entitlements/images";
import type { LxdImageRegistry } from "types/image";
import usePanelParams from "util/usePanelParams";
import classnames from "classnames";
import { useIsScreenBelow } from "context/useIsScreenBelow";

interface Props {
  imageRegistry: LxdImageRegistry;
  hasLabel?: boolean;
}

const EditImageRegistryButton: FC<Props> = ({
  imageRegistry,
  hasLabel = true,
}) => {
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

  return (
    <Button
      appearance={hasLabel ? "default" : "base"}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !hasLabel || !isSmallScreen,
      })}
      disabled={Boolean(disabledReason())}
      type="button"
      hasIcon
      aria-label={hasLabel ? undefined : "Edit registry"}
      title={disabledReason() || "Edit registry"}
      onClick={() => {
        openEditImageRegistry(imageRegistry.name);
      }}
    >
      {(!hasLabel || !isSmallScreen) && <Icon name="edit" />}
      {hasLabel && <span>Edit Registry</span>}
    </Button>
  );
};

export default EditImageRegistryButton;
