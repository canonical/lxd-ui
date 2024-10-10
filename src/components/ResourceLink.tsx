import { Icon } from "@canonical/react-components";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

export type ResourceType =
  | "container"
  | "virtual-machine"
  | "snapshot"
  | "profile"
  | "project"
  | "cluster-member"
  | "network"
  | "pool"
  | "volume"
  | "iso-volume"
  | "image"
  | "oidc-identity"
  | "certificate"
  | "auth-group"
  | "device";

const resourceIconMap: Record<ResourceType, string> = {
  container: "lxd-container",
  "virtual-machine": "pods",
  snapshot: "snapshot",
  profile: "repository",
  project: "folder",
  "cluster-member": "single-host",
  network: "exposed",
  pool: "",
  volume: "",
  "iso-volume": "iso",
  image: "image",
  "oidc-identity": "user",
  certificate: "certificate",
  "auth-group": "user-group",
  device: "units",
};

interface Props {
  type: ResourceType;
  value: string;
  to: string;
}

const ResourceLink: FC<Props> = ({ type, value, to }) => {
  const icon = resourceIconMap[type];
  const navigate = useNavigate();
  return (
    <button className="p-chip is-inline" onClick={() => navigate(to)}>
      {!icon && <span className="p-chip__lead">{type}</span>}
      <span className="p-chip__value resource-link">
        {icon && <Icon name={icon} />}
        {value}
      </span>
    </button>
  );
};

export default ResourceLink;
