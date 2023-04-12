import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Col, Row } from "@canonical/react-components";
import { LxdProfile } from "types/profile";
import { isDiskDevice, isNicDevice } from "util/devices";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import ProfileUsedByProject from "./ProfileUsedByProject";
import ExpandableList from "components/ExpandableList";
import ItemName from "components/ItemName";

interface Props {
  profile: LxdProfile;
}

const ProfileDetailOverview: FC<Props> = ({ profile }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const updateContentHeight = () => {
    updateMaxHeight("profile-overview-tab");
  };
  useEffect(updateContentHeight, []);
  useEventListener("resize", updateContentHeight);

  return (
    <div className="profile-overview-tab">
      <Row className="general">
        <Col size={3}>
          <h2 className="p-heading--4">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">Name</th>
                <td>
                  <ItemName item={profile} />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{profile.description ? profile.description : "-"}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="devices">
        <Col size={3}>
          <h2 className="p-heading--4">Devices</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr className="list-wrapper">
                <th className="p-muted-heading">Networks</th>
                <td>
                  {Object.values(profile.devices).some(isNicDevice) ? (
                    <ExpandableList
                      progressive
                      items={Object.values(profile.devices)
                        .filter(isNicDevice)
                        .map((device) => (
                          <div
                            key={device.name}
                            className="u-truncate list-item"
                            title={device.network}
                          >
                            {device.network}
                          </div>
                        ))}
                    />
                  ) : (
                    <>-</>
                  )}
                </td>
              </tr>
              <tr className="list-wrapper">
                <th className="p-muted-heading">Storage</th>
                <td>
                  {Object.values(profile.devices).some(isDiskDevice) ? (
                    <ExpandableList
                      progressive
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
                    <>-</>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="instances list-wrapper">
        <Col size={3}>
          <h2 className="p-heading--4">Instances</h2>
        </Col>
        <Col size={7}>
          <ProfileUsedByProject profile={profile} project={project} />
        </Col>
      </Row>
    </div>
  );
};

export default ProfileDetailOverview;
