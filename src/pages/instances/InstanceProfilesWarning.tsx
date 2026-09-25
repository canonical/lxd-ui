import { Notification } from "@canonical/react-components";
import type { FC } from "react";
import { useProfiles } from "context/useProfiles";

interface Props {
  instanceProfiles: string[];
  project: string;
}

const InstanceProfilesWarning: FC<Props> = ({ instanceProfiles, project }) => {
  const { data: profiles = [], isLoading } = useProfiles(project);

  const isMissingSomeProfiles = instanceProfiles.some(
    (profile) => !profiles?.find((p) => p.name === profile),
  );

  if (isMissingSomeProfiles && !isLoading) {
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
