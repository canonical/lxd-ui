import { FC } from "react";
import { Button } from "@canonical/react-components";
import { LxdIdentity } from "types/permissions";
import usePanelParams from "util/usePanelParams";

interface Props {
  identities: LxdIdentity[];
  className?: string;
}

const PermissionIdentityEditGroupsBtn: FC<Props> = ({
  identities,
  className,
}) => {
  const panelParams = usePanelParams();
  const moreThanOneIdentity = identities.length > 1;
  const buttonText = moreThanOneIdentity
    ? `Modify groups for ${identities.length} users`
    : "Modify groups";

  return (
    <>
      <Button
        onClick={() => panelParams.openIdentityGroups(identities)}
        aria-label="Modify groups"
        title="Modify groups"
        className={className}
        disabled={!identities.length}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default PermissionIdentityEditGroupsBtn;
