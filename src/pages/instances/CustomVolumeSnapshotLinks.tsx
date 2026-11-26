import type { FC } from "react";
import { ContextualMenu } from "@canonical/react-components";
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
      <span>{link.deviceLabel}</span>
      <VolumeSnapshotLinkChip name={link.snapshotName} volume={link.volume} />
    </>
  );

  return (
    <div className="snapshot-link">
      {renderLink(links[0])}
      {links.length > 1 && (
        <ContextualMenu
          position="left"
          scrollOverflow
          toggleAppearance="base"
          toggleClassName="snapshot-links-toggle u-no-margin--bottom u-text--muted"
          toggleLabel={`+${links.length - 1}`}
          toggleProps={{
            "aria-label": `Show ${links.length - 1} more custom disk snapshots`,
            "aria-haspopup": "dialog",
            dense: true,
            small: true,
          }}
          dropdownProps={{
            role: "dialog",
            "aria-label": "Custom disk snapshots",
          }}
          dropdownClassName="snapshot-links-menu"
        >
          <ul className="p-list u-no-margin--bottom">
            {links.slice(1).map((link) => (
              <li
                key={`${link.volume.pool}/${link.volume.name}/${link.snapshotName}/${link.deviceLabel}`}
                className="p-list__item snapshot-link"
              >
                {renderLink(link)}
              </li>
            ))}
          </ul>
        </ContextualMenu>
      )}
    </div>
  );
};

export default CustomVolumeSnapshotLinks;
