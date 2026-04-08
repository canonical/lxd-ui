import type { FC } from "react";
import { useServerEntitlements } from "util/entitlements/server";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

export const CreateImageRegistryButton: FC = () => {
  const { canCreateImageRegistries } = useServerEntitlements();
  const isDisabled = !canCreateImageRegistries();
  const { openCreateImageRegistry } = usePanelParams();

  return (
    <Button
      name="Create registry"
      disabled={isDisabled}
      hasIcon
      appearance="positive"
      className="u-float-right u-no-margin--bottom"
      title={
        isDisabled && "You don't have permissions to create image registries"
      }
      onClick={openCreateImageRegistry}
    >
      <Icon name="plus" light className="u-margin--right" />
      <span>Create registry</span>
    </Button>
  );
};
