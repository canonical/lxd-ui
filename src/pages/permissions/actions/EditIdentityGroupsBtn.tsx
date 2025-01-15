import { FC } from "react";
import { Button, ButtonProps } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import usePanelParams from "util/usePanelParams";

interface Props {
  identities: LxdIdentity[];
  className?: string;
}

const EditIdentityGroupsBtn: FC<Props & ButtonProps> = ({
  identities,
  className,
  ...buttonProps
}) => {
  const panelParams = usePanelParams();
  const buttonText =
    identities.length > 1
      ? `Modify groups for ${identities.length} identities`
      : "Modify groups";

  return (
    <>
      <Button
        onClick={() => panelParams.openIdentityGroups()}
        aria-label="Modify groups"
        title="Modify groups"
        className={className}
        disabled={!identities.length || !!panelParams.panel}
        {...buttonProps}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default EditIdentityGroupsBtn;
