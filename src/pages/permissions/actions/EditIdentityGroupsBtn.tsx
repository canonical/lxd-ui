import { FC } from "react";
import { Button, ButtonProps } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import usePanelParams from "util/usePanelParams";
import { useIdentityEntitlements } from "util/entitlements/identities";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  identities: LxdIdentity[];
  className?: string;
}

const EditIdentityGroupsBtn: FC<Props & ButtonProps> = ({
  identities,
  className,
  ...buttonProps
}) => {
  const { canEditIdentity } = useIdentityEntitlements();
  const panelParams = usePanelParams();
  const buttonText =
    identities.length > 1
      ? `Modify groups for ${identities.length} identities`
      : "Modify groups";

  const restrictedIdentities = identities.filter(
    (identity) => !canEditIdentity(identity),
  );

  const getRestrictedWarning = () => {
    const test = restrictedIdentities
      .map((identity) => `\n- ${identity.name}`)
      .join("");
    return `You do not have permission to modify ${restrictedIdentities.length > 1 ? "some of the selected" : "the selected"} ${pluralize("identity", restrictedIdentities.length)}:${test}`;
  };

  return (
    <>
      <Button
        onClick={() => panelParams.openIdentityGroups()}
        aria-label="Modify groups"
        title={
          restrictedIdentities.length ? getRestrictedWarning() : "Modify groups"
        }
        className={className}
        disabled={
          !!restrictedIdentities.length ||
          !identities.length ||
          !!panelParams.panel
        }
        {...buttonProps}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default EditIdentityGroupsBtn;
