import type { FC } from "react";
import { List } from "@canonical/react-components";
import type { LxdProfile } from "types/profile";
import { hasCloudInit } from "util/profiles";

interface Props {
  profile?: LxdProfile;
}

const ProfileConfigurationSections: FC<Props> = ({ profile }) => {
  if (!profile) {
    return "-";
  }

  const hasSecurityPolicies = Object.keys(profile.config).some((key) =>
    key.startsWith("security."),
  );

  const hasSnapshots = Object.keys(profile.config).some((key) =>
    key.startsWith("snapshots."),
  );

  const hasMigration = Boolean(
    profile.config["migration.stateful"] || profile.config["cluster.evacuate"],
  );

  const hasBoot = Object.keys(profile.config).some((key) =>
    key.startsWith("boot."),
  );

  const hasCloudInitConfig = hasCloudInit(profile);

  const configSections = [
    hasSecurityPolicies && "Security policies",
    hasSnapshots && "Snapshots",
    hasMigration && "Migration",
    hasBoot && "Boot",
    hasCloudInitConfig && "Cloud init",
  ].filter(Boolean);

  return configSections.length > 0 ? (
    <List
      items={configSections}
      middot
      className="u-no-margin profile-configuration-sections"
      title={configSections.join(", ")}
    />
  ) : (
    "-"
  );
};

export default ProfileConfigurationSections;
