import type { FC } from "react";
import { Button, Tooltip } from "@canonical/react-components";
import VolumeSnapshotLinkChip from "pages/storage/VolumeSnapshotLinkChip";
import type { CustomVolumeSnapshotLink } from "util/instanceSnapshots";

interface Props {
  links: CustomVolumeSnapshotLink[];
}

const CustomVolumeSnapshotLinks: FC<Props> = ({ links }) => {
  if (links.length === 0) {
    return "-";
  }

  const renderLink = (link: CustomVolumeSnapshotLink) => (
    <>
      <span className="snapshot-link__device">{link.deviceLabel}</span>
      <VolumeSnapshotLinkChip name={link.snapshot.name} volume={link.volume} />
    </>
  );

  return (
    <div className="snapshot-link">
      {renderLink(links[0])}
      {links.length > 1 && (
        <Tooltip
          zIndex={1000}
          position="btm-left"
          message={
            <ul className="p-list u-no-margin--bottom">
              {links.map((link) => (
                <li
                  key={link.deviceLabel}
                  className="p-list__item snapshot-link"
                >
                  {renderLink(link)}
                  <span className="u-text--muted">{link.volume.name}</span>
                </li>
              ))}
            </ul>
          }
        >
          <Button
            appearance="base"
            className="u-no-margin--bottom u-text--muted"
            dense
            small
            aria-label={`Show all ${links.length} custom disk snapshots`}
          >
            +{links.length - 1}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default CustomVolumeSnapshotLinks;
