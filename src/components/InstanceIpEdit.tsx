import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  address: string;
  instanceName: string;
  projectName: string;
}

export const InstanceIpEdit: FC<Props> = ({
  address,
  instanceName,
  projectName,
}) => {
  return (
    <div className="instance-ip-edit-content">
      <div className="u-truncate instance-ip-edit-address" title={address}>
        {address}
      </div>
      <Link
        to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/instance/${encodeURIComponent(instanceName)}/configuration/network`}
        rel="noopener noreferrer"
        className="p-button-base instance-ip-edit-link is-dense"
        type="button"
        title={`Edit network configuration for instance ${instanceName}`}
      >
        <Icon name="edit" />
      </Link>
    </div>
  );
};
