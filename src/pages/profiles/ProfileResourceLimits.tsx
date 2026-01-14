import type { FC } from "react";
import { List } from "@canonical/react-components";
import type { LxdProfile } from "types/profile";

interface Props {
  profile: LxdProfile;
}

const ProfileResourceLimits: FC<Props> = ({ profile }) => {
  const hasLimits =
    profile.config["limits.cpu"] || profile.config["limits.memory"];

  if (!hasLimits) {
    return <>-</>;
  }

  return (
    <List
      items={[
        `CPU: ${profile.config["limits.cpu"] || "-"}`,
        `Memory: ${profile.config["limits.memory"] || "-"}`,
      ]}
      middot
      className="u-no-margin"
    />
  );
};

export default ProfileResourceLimits;
