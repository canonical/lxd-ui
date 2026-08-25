import type { FC } from "react";
import classnames from "classnames";
import { Tooltip } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import { IDENTITY_TYPE_HELP_TEXT } from "util/permissionIdentities";

interface Props {
  identity: LxdIdentity;
  className?: string;
}

const getIdentityType = (identity: LxdIdentity): string => {
  return `${identity.authentication_method.toUpperCase()} - ${identity.type}`;
};

// Identity types can carry a suffix (e.g. "(pending)"), match against the known base types
const getHelpText = (type: LxdIdentity["type"]) => {
  const baseType = (
    Object.keys(IDENTITY_TYPE_HELP_TEXT) as Array<
      keyof typeof IDENTITY_TYPE_HELP_TEXT
    >
  ).find((value) => type.startsWith(value));
  return baseType ? IDENTITY_TYPE_HELP_TEXT[baseType] : undefined;
};

const IdentityTypeChip: FC<Props> = ({ identity, className }) => {
  const helpText = getHelpText(identity.type);
  const identityType = getIdentityType(identity);

  const chip = (
    <span
      className={classnames("p-chip is-dense is-inline", className)}
      tabIndex={helpText ? 0 : undefined}
    >
      <span className="p-chip__value u-truncate">{identity.type}</span>
    </span>
  );

  if (!helpText) {
    return chip;
  }

  return (
    <Tooltip
      zIndex={1000}
      position="right"
      positionElementClassName="identity-type-chip-tooltip-wrapper"
      tooltipClassName="identity-type-chip-tooltip"
      message={
        <>
          <div className="p-text--small-caps u-text--muted u-no-margin--bottom">
            Type
          </div>
          <div className="identity-type-chip-tooltip-title u-no-margin--top">
            {identityType}
          </div>
          <div className="p-text--small-caps u-text--muted">Description</div>
          <div>{helpText.description}</div>
        </>
      }
    >
      {chip}
    </Tooltip>
  );
};

export default IdentityTypeChip;
