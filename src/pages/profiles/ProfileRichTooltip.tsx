import { type FC } from "react";
import ProfileLink from "pages/profiles/ProfileLink";
import { useProfile } from "context/useProfiles";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import {
  LARGE_TOOLTIP_BREAKPOINT,
  MEDIUM_TOOLTIP_BREAKPOINT,
  RichTooltipTable,
} from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { isProjectWithProfiles } from "util/projects";
import { useCurrentProject } from "context/useCurrentProject";
import DevicesSummaryList from "components/DevicesSummaryList";
import { getProfileInstances } from "util/usedBy";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ProfileTruncatedNetworkList from "pages/profiles/ProfileTruncatedNetworkList";
import ResourceLink from "components/ResourceLink";
import { getDefaultStoragePool } from "util/helpers";
import ProfileConfigurationSections from "pages/profiles/ProfileConfigurationSections";
import ProfileResourceLimits from "pages/profiles/ProfileResourceLimits";

interface Props {
  profileName: string;
  projectName: string;
}

const ProfileRichTooltip: FC<Props> = ({ profileName, projectName }) => {
  const { data: profile, isLoading: isProfileLoading } = useProfile(
    profileName,
    projectName,
  );
  const { project, isLoading: isProjectLoading } = useCurrentProject();
  const featuresProfiles = isProjectWithProfiles(project);
  const isAboveMedium = !useIsScreenBelow(MEDIUM_TOOLTIP_BREAKPOINT, "height");
  const isAboveLarge = !useIsScreenBelow(LARGE_TOOLTIP_BREAKPOINT, "height");

  const isLoading = isProfileLoading || isProjectLoading;

  if (!profile && !isLoading) {
    return (
      <>
        Profile <ResourceLabel type="profile" value={profileName} bold /> not
        found
      </>
    );
  }

  const profileDescription = profile ? profile.description || "-" : "-";
  const usageCount = getProfileInstances(
    projectName,
    projectName === "default",
    profile ? profile.used_by : [],
  ).length;
  const defaultStoragePool = profile ? getDefaultStoragePool(profile) : "";

  const rows: TooltipRow[] = [
    {
      title: "Profile",
      value: profile ? <ProfileLink profile={profile} /> : <Spinner />,
      valueTitle: profileName,
    },
    {
      title: "Description",
      value: profileDescription,
      valueTitle: profileDescription,
    },
    {
      title: "Defined in",
      value: `${featuresProfiles ? "Current" : "Default"} project`,
    },
    {
      title: "Root storage",
      value: defaultStoragePool ? (
        <ResourceLink
          type="pool"
          value={defaultStoragePool}
          to={`/ui/project/${encodeURIComponent(projectName)}/storage/pool/${encodeURIComponent(defaultStoragePool)}`}
        />
      ) : (
        "-"
      ),
      truncate: false,
      className: "storage-list",
    },
    {
      title: "Networks",
      value: profile ? (
        <ProfileTruncatedNetworkList profile={profile} project={projectName} />
      ) : (
        "-"
      ),
      truncate: false,
      className: "networks-list",
    },
  ];

  if (isAboveMedium) {
    rows.push(
      {
        title: "Devices",
        value: profile ? (
          <DevicesSummaryList devices={Object.values(profile.devices)} />
        ) : (
          "-"
        ),
        truncate: false,
      },
      {
        title: "Limits",
        value: profile ? <ProfileResourceLimits profile={profile} /> : "-",
        truncate: false,
      },
      {
        title: "Configuration",
        value: <ProfileConfigurationSections profile={profile} />,
        truncate: false,
      },
    );
  }

  if (isAboveLarge) {
    rows.push({
      title: "Used by",
      value: usageCount,
    });
  }

  return (
    <RichTooltipTable rows={rows} className="profile-rich-tooltip-table" />
  );
};

export default ProfileRichTooltip;
