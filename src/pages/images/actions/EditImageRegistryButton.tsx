import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useImageRegistriesEntitlements } from "util/entitlements/images";
import type { LxdImageRegistry } from "types/image";
import usePanelParams from "util/usePanelParams";

interface Props {
  imageRegistry: LxdImageRegistry;
  isShortVersion?: boolean;
}

const EditImageRegistryButton: FC<Props> = ({
  imageRegistry,
  isShortVersion = false,
}) => {
  const { openEditImageRegistry } = usePanelParams();
  const { canEditImageRegistry } = useImageRegistriesEntitlements();
  const isDisabled =
    imageRegistry.builtin || !canEditImageRegistry(imageRegistry);

  const disabledReason = () => {
    if (imageRegistry.builtin) {
      return "Built-in image registries cannot be edited.";
    }
    if (!canEditImageRegistry(imageRegistry)) {
      return "You do not have permission to edit this image registry.";
    }
    return undefined;
  };

  return (
    <Button
      appearance={isShortVersion ? "base" : "default"}
      className="u-no-margin--bottom"
      disabled={isDisabled}
      dense
      hasIcon
      title={disabledReason()}
      onClick={() => {
        openEditImageRegistry(imageRegistry.name);
      }}
    >
      <Icon name="edit" />
      {!isShortVersion && <span>Edit</span>}
    </Button>
  );
};

export default EditImageRegistryButton;
