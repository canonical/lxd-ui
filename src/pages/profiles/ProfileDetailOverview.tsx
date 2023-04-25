import React, { FC, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Col, Notification, Row } from "@canonical/react-components";
import { LxdProfile } from "types/profile";
import { isDiskDevice, isNicDevice } from "util/devices";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import ProfileUsedByProject from "./ProfileUsedByProject";
import ExpandableList from "components/ExpandableList";
import ItemName from "components/ItemName";
import classnames from "classnames";
import { CLOUD_INIT } from "./forms/ProfileFormMenu";
import { slugify } from "util/slugify";
import { getProfileInstances } from "util/usedBy";

interface Props {
  profile: LxdProfile;
  featuresProfiles: boolean;
}

const ProfileDetailOverview: FC<Props> = ({ profile, featuresProfiles }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const updateContentHeight = () => {
    updateMaxHeight("profile-overview-tab");
  };
  useEffect(updateContentHeight, []);
  useEventListener("resize", updateContentHeight);

  const hasCloudInit =
    profile.config["cloud-init.user-data"] ||
    profile.config["cloud-init.vendor-data"] ||
    profile.config["cloud-init.network-config"];

  const isDefaultProject = project === "default";
  const usageCount = getProfileInstances(
    project,
    isDefaultProject,
    profile.used_by
  ).length;

  return (
    <div className="profile-overview-tab">
      {!featuresProfiles && (
        <Notification severity="caution" title="Inherited profile">
          Modifications are only available in the default project.
        </Notification>
      )}
      <Row className="section">
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
      <Row className="section">
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
                    <>-</>
                  )}
                </td>
              </tr>
              <tr className="list-wrapper">
                <th className="p-muted-heading">Storage</th>
                <td>
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
                    <>-</>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--4">Limits</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">CPU</th>
                <td>{profile.config["limits.cpu"] || "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Memory</th>
                <td>{profile.config["limits.memory"] || "-"}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row
        className={classnames("section", {
          "u-hide": !hasCloudInit,
        })}
      >
        <Col size={3}>
          <h2 className="p-heading--4">Cloud init</h2>
        </Col>
        <Col size={7} className="view-config">
          <Link
            to={`/ui/${project}/profiles/detail/${
              profile.name
            }/configuration/${slugify(CLOUD_INIT)}`}
          >
            View configuration
          </Link>
        </Col>
      </Row>
      <Row className="usage list-wrapper">
        <Col size={3}>
          <h2 className="p-heading--4">Usage ({usageCount})</h2>
        </Col>
        <Col size={7}>
          {usageCount > 0 ? (
            <table>
              <tbody>
                <ProfileUsedByProject
                  profile={profile}
                  project={project}
                  headingClassName="p-muted-heading"
                />
              </tbody>
            </table>
          ) : (
            <>-</>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProfileDetailOverview;
