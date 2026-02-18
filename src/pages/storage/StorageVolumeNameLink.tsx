import { ICONS, Icon } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdStorageVolume } from "types/storage";
import classnames from "classnames";
import { linkForVolumeDetail, hasVolumeDetailPage } from "util/storageVolume";
import { useInstances } from "context/useInstances";
import { useImagesInProject } from "context/useImages";
import { getImageAlias, getImageName } from "util/images";

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
  const isExternalLink = !hasVolumeDetailPage(volume);

  const isInstance =
    volume.type === "container" || volume.type === "virtual-machine";
  const { data: instances = [] } = useInstances(volume.project);
  const instance =
    isInstance && instances.find((instance) => instance.name === volume.name);

  const isImage = volume.type === "image";
  const { data: images = [] } = useImagesInProject(volume.project);
  const image =
    isImage && images.find((image) => image.fingerprint === volume.name);

  const isCustom = volume.type === "custom";
  const displayLink = instance || image || isCustom;
  const getCaption = () => {
    if (overrideName) {
      return overrideName;
    }
    if (image) {
      return `${getImageName(image)} ${getImageAlias(image)}`;
    }
    return volume.name;
  };
  const caption = getCaption();

  if (overrideName && !displayLink) {
    return null;
  }

  return (
    <div className={classnames("u-flex", className)}>
      <div
        className={classnames("u-truncate", "volume-name-link")}
        title={caption}
      >
        {displayLink ? (
          <Link
            to={linkForVolumeDetail(volume)}
            className={isExternalLink ? "has-icon" : undefined}
          >
            {caption}
            {isExternalLink && <Icon name={ICONS.externalLink} />}
          </Link>
        ) : (
          caption
        )}
      </div>
    </div>
  );
};

export default StorageVolumeNameLink;
