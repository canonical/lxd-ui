import { Button, Icon } from "@canonical/react-components";
import { useSmallScreen } from "context/useSmallScreen";
import type { FC } from "react";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  openPanel: () => void;
}

const CreateTlsIdentityBtn: FC<Props> = ({ openPanel }) => {
  const isSmallScreen = useSmallScreen();
  const { canCreateIdentities } = useServerEntitlements();

  return (
    <>
      <Button
        appearance="positive"
        className="u-float-right u-no-margin--bottom"
        onClick={openPanel}
        hasIcon={!isSmallScreen}
        title={
          canCreateIdentities()
            ? ""
            : "You do not have permission to create identities"
        }
        disabled={!canCreateIdentities()}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>Create TLS Identity</span>
      </Button>
    </>
  );
};

export default CreateTlsIdentityBtn;
