import { ICONS, Icon } from "@canonical/react-components";
import { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdStorageVolume } from "types/storage";
import classnames from "classnames";
import {
  generateLinkForVolumeDetail,
  hasVolumeDetailPage,
} from "util/storageVolume";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  volume: LxdStorageVolume;
  isExternalLink?: boolean;
  overrideName?: string;
  className?: string;
}

const StorageVolumeNameLink: FC<Props> = ({
  volume,
  overrideName,
  className,
}) => {
  const { project } = useCurrentProject();
  const isExternalLink = !hasVolumeDetailPage(volume);
  const caption = overrideName ? overrideName : volume.name;

  return (
    <div className={classnames("u-flex", className)}>
      <div
        className={classnames("u-truncate", "volume-name-link")}
        title={caption}
      >
        <Link
          to={generateLinkForVolumeDetail(volume, project?.name ?? "")}
          className={isExternalLink ? "has-icon" : undefined}
        >
          {caption}
          {isExternalLink && <Icon name={ICONS.externalLink} />}
        </Link>
      </div>
    </div>
  );
};

export default StorageVolumeNameLink;
