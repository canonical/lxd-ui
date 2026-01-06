import type { FC } from "react";
import type { LxdProfile } from "types/profile";
import { isNicDevice } from "util/devices";
import ResourceLink from "components/ResourceLink";
import TruncatedList from "components/TruncatedList";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  profile: LxdProfile;
  project: string;
}

const ProfileTruncatedNetworkList: FC<Props> = ({ profile, project }) => {
  return (
    <>
      {Object.values(profile.devices).some(isNicDevice) ? (
        <TruncatedList
          items={Object.values(profile.devices)
            .filter(isNicDevice)
            .map((device) => (
              <ResourceLink
                key={device.network}
                type="network"
                value={device.network}
                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(device.network)}`}
              />
            ))}
        />
      ) : (
        "-"
      )}
    </>
  );
};

export default ProfileTruncatedNetworkList;
