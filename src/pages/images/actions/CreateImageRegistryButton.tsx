import type { FC } from "react";
import { useServerEntitlements } from "util/entitlements/server";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import DsIcon from "components/DsIcon";

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
        isDisabled
          ? "You don't have permissions to create image registries"
          : undefined
      }
      onClick={openCreateImageRegistry}
    >
      <DsIcon icon="plus" className="u-margin--right" />
      <span>Create registry</span>
    </Button>
  );
};
