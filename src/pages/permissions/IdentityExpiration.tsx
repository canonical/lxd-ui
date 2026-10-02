import { type FC } from "react";
import { isBeforeNow, isoTimeToString, UNDEFINED_DATE } from "util/helpers";
import type { LxdIdentity } from "types/permissions";
import { Tooltip } from "@canonical/react-components";
import DsIcon from "components/DsIcon";

interface Props {
  identity: LxdIdentity;
}

const IdentityExpiration: FC<Props> = ({ identity }) => {
  const expiry = identity.expires_at ?? UNDEFINED_DATE;
  const isValid = expiry !== UNDEFINED_DATE;
  const isExpired = isBeforeNow(expiry);
  const caption = isValid ? isoTimeToString(expiry) : "-";

  return isExpired ? (
    <Tooltip message="Has expired" position="right">
      <span>{caption}</span>
      <DsIcon icon="warning" className="u-margin-left--small" />
    </Tooltip>
  ) : (
    caption
  );
};

export default IdentityExpiration;
