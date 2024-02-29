import { ICONS, Icon } from "@canonical/react-components";
import { FC } from "react";
import { Link } from "react-router-dom";
import { LxdStorageVolume } from "types/storage";
import classnames from "classnames";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  isExternalLink?: boolean;
  overrideName?: string;
  className?: string;
}

export const generateLinkForVolumeDetail = (args: {
  volume: LxdStorageVolume;
  project: string;
}) => {
  const { volume, project } = args;
  let path = `storage/pool/${volume.pool}/volumes/${volume.type}/${volume.name}`;

  // NOTE: name of a volume created from an instance is exactly the same as the instance name
  if (volume.type === "container" || volume.type === "virtual-machine") {
    path = `instance/${volume.name}`;
  }

  if (volume.type === "image") {
    path = "images";
  }

  return `/ui/project/${project}/${path}`;
};

const StorageVolumeNameLink: FC<Props> = ({
  volume,
  project,
  isExternalLink,
  overrideName,
  className,
}) => {
  return (
    <div className={classnames("u-flex", className)}>
      <div
        className={classnames("u-truncate", "volume-name-link")}
        title={`Volume ${volume.name}`}
      >
        <Link to={generateLinkForVolumeDetail({ volume, project })}>
          {overrideName ? overrideName : volume.name}
        </Link>
      </div>
      {isExternalLink && <Icon name={ICONS.externalLink} />}
    </div>
  );
};

export default StorageVolumeNameLink;
