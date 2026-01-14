import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import ProfileRichTooltip from "pages/profiles/ProfileRichTooltip";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";

interface Props {
  profileName: string;
  projectName: string;
  className?: string;
  disabled?: boolean;
}

const ProfileRichChip: FC<Props> = ({
  profileName,
  projectName,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const profileUrl = `/ui/project/${encodeURIComponent(projectName)}/profile/${encodeURIComponent(profileName)}`;
  const resourceLink = (
    <ResourceLink
      type="profile"
      value={profileName}
      to={profileUrl}
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
      message={
        <ProfileRichTooltip
          profileName={profileName}
          projectName={projectName}
        />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};

export default ProfileRichChip;
