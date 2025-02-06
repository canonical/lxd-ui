import { Notification } from "@canonical/react-components";
import { FC } from "react";
import { LxdProfile } from "types/profile";

interface Props {
  instanceProfiles: string[];
  profiles?: LxdProfile[];
}

const InstanceProfilesWarning: FC<Props> = ({ instanceProfiles, profiles }) => {
  const isMissingSomeProfiles = instanceProfiles.some(
    (profile) => !profiles?.find((p) => p.name === profile),
  );

  if (isMissingSomeProfiles) {
    return (
      <Notification severity="caution" title="Restricted permissions">
        You do not have permission to view all profiles applied to this
        instance. This may cause inherited configuration values to be displayed
        incorrectly.
      </Notification>
    );
  }

  return null;
};

export default InstanceProfilesWarning;
