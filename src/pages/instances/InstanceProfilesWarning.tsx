import { Notification } from "@canonical/react-components";
import { FC } from "react";
import { LxdProfile } from "types/profile";

interface Props {
  instanceProfiles: string[];
  profiles?: LxdProfile[];
  isCreating?: boolean;
}

const InstanceProfilesWarning: FC<Props> = ({
  instanceProfiles,
  profiles,
  isCreating,
}) => {
  const editContext = !isCreating
    ? "This may cause inherited configuration values to be displayed incorrectly."
    : "";

  if (!profiles?.length) {
    return (
      <Notification severity="caution" title="Restricted permissions">
        You do not have permission to view profiles in the current project.{" "}
        {editContext}
      </Notification>
    );
  }

  const profilesSet = new Set(profiles.map((profile) => profile.name));
  for (const instanceProfile of instanceProfiles) {
    if (!profilesSet.has(instanceProfile)) {
      return (
        <Notification severity="caution" title="Restricted permissions">
          You do not have permission to view some profiles applied to this
          instance. {editContext}
        </Notification>
      );
    }
  }

  return null;
};

export default InstanceProfilesWarning;
