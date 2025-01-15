import { FC } from "react";
import type { LxdProfile } from "types/profile";
import { isDiskDevice } from "util/devices";
import ExpandableList from "components/ExpandableList";
import ResourceLink from "components/ResourceLink";

interface Props {
  profile: LxdProfile;
  project: string;
}

const ProfileStorageList: FC<Props> = ({ profile, project }) => {
  return (
    <>
      {Object.values(profile.devices).some(isDiskDevice) ? (
        <ExpandableList
          items={Object.values(profile.devices)
            .filter(isDiskDevice)
            .map((device) => (
              <ResourceLink
                key={device.path}
                type="pool"
                value={device.pool || ""}
                to={`/ui/project/${project}/storage/pool/${device.pool}`}
              />
            ))}
        />
      ) : (
        <div className="list-item">-</div>
      )}
    </>
  );
};

export default ProfileStorageList;
