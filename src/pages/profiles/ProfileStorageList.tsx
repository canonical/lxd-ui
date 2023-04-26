import React, { FC } from "react";
import { LxdProfile } from "types/profile";
import { isDiskDevice } from "util/devices";
import ExpandableList from "components/ExpandableList";

interface Props {
  profile: LxdProfile;
}

const ProfileStorageList: FC<Props> = ({ profile }) => {
  return (
    <>
      {Object.values(profile.devices).some(isDiskDevice) ? (
        <ExpandableList
          items={Object.values(profile.devices)
            .filter(isDiskDevice)
            .map((device) => (
              <div
                key={device.path}
                className="u-truncate list-item"
                title={device.pool}
              >
                {device.pool}
              </div>
            ))}
        />
      ) : (
        <div className="list-item">-</div>
      )}
    </>
  );
};

export default ProfileStorageList;
