import React, { FC } from "react";
import { LxdProfile } from "types/profile";
import { isNicDevice } from "util/devices";
import ExpandableList from "components/ExpandableList";

interface Props {
  profile: LxdProfile;
}

const ProfileNetworkList: FC<Props> = ({ profile }) => {
  return (
    <>
      {Object.values(profile.devices).some(isNicDevice) ? (
        <ExpandableList
          items={Object.values(profile.devices)
            .filter(isNicDevice)
            .map((device) => (
              <div
                key={device.network}
                className="u-truncate list-item"
                title={device.network}
              >
                {device.network}
              </div>
            ))}
        />
      ) : (
        <div className="list-item">-</div>
      )}
    </>
  );
};

export default ProfileNetworkList;
