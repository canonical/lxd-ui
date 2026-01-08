import type { FC } from "react";
import type { LxdProfile } from "types/profile";
import { isNicDevice } from "util/devices";
import ExpandableList from "components/ExpandableList";
import NetworkRichChip from "pages/networks/NetworkRichChip";

interface Props {
  profile: LxdProfile;
  project: string;
}

const ProfileNetworkList: FC<Props> = ({ profile, project }) => {
  return (
    <>
      {Object.values(profile.devices).some(isNicDevice) ? (
        <ExpandableList
          items={Object.values(profile.devices)
            .filter(isNicDevice)
            .map((device) => (
              <NetworkRichChip
                key={device.network}
                networkName={device.network}
                projectName={project}
              />
            ))}
        />
      ) : (
        <div className="list-item">-</div>
      )}
    </>
  );
};

export default ProfileNetworkList;
