import { FC } from "react";
import { LxdProfile } from "types/profile";
import { isNicDevice } from "util/devices";
import ExpandableList from "components/ExpandableList";
import ResourceLink from "components/ResourceLink";

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
              <ResourceLink
                key={device.network}
                type="network"
                value={device.network}
                to={`/ui/project/${project}/network/${device.network}`}
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
