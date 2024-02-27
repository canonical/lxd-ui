import { FC } from "react";
import { Link } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import { LxdIdentity } from "types/permissions";

interface Props {
  identity: LxdIdentity;
}

const PermissionIdentityHeader: FC<Props> = ({ identity }) => {
  return (
    <RenameHeader
      name={identity.name}
      parentItems={[
        <Link to={`/ui/permissions`} key={1}>
          Identities
        </Link>,
      ]}
      isLoaded={true}
      renameDisabledReason="Cannot rename identities"
    />
  );
};

export default PermissionIdentityHeader;
