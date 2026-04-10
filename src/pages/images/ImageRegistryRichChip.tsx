import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import { ROOT_PATH } from "util/rootPath";
import ImageRegistryRichTooltip from "./ImageRegistryRichTooltip";

interface Props {
  imageRegistryName: string;
  className?: string;
  disabled?: boolean;
}

const ImageRegistryRichChip: FC<Props> = ({
  imageRegistryName,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const imageRegistryUrl = `${ROOT_PATH}/ui/image-registry/${encodeURIComponent(imageRegistryName)}`;

  const resourceLink = (
    <ResourceLink
      type="image-registry"
      value={imageRegistryName}
      to={imageRegistryUrl}
      hasTitle={!showTooltip}
      className={className}
      disabled={disabled}
    />
  );

  if (!showTooltip) {
    return <>{resourceLink}</>;
  }

  return (
    <Tooltip
      zIndex={1000}
      position="right"
      message={
        <ImageRegistryRichTooltip
          imageRegistryName={imageRegistryName}
          imageRegistryUrl={imageRegistryUrl}
        />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};

export default ImageRegistryRichChip;
