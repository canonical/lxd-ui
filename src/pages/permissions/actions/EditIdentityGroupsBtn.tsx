import type { FC } from "react";
import type { ButtonProps } from "@canonical/react-components";
import { Button, Icon } from "@canonical/react-components";
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
    const restrictedList = restrictedIdentities
      .map((identity) => `\n- ${identity.name}`)
      .join("");
    return `You do not have permission to modify ${restrictedIdentities.length > 1 ? "some of the selected" : "the selected"} ${pluralize("identity", restrictedIdentities.length)}:${restrictedList}`;
  };

  return (
    <>
      <Button
        onClick={() => {
          panelParams.openIdentityGroups();
        }}
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
        hasIcon
        {...buttonProps}
      >
        <Icon name="user-group" />
        <span>{buttonText}</span>
      </Button>
    </>
  );
};

export default EditIdentityGroupsBtn;
