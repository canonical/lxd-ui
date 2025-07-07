import type { FC } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Col, Row, useListener, useNotify } from "@canonical/react-components";
import type { LxdProfile } from "types/profile";
import { updateMaxHeight } from "util/updateMaxHeight";
import ProfileInstances from "./ProfileInstances";
import ItemName from "components/ItemName";
import classnames from "classnames";
import { CLOUD_INIT } from "./forms/ProfileFormMenu";
import { slugify } from "util/slugify";
import { getProfileInstances } from "util/usedBy";
import NetworkListTable from "components/NetworkListTable";
import DeviceListTable from "components/DeviceListTable";
import ResourceLink from "components/ResourceLink";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  profile: LxdProfile;
}

const ProfileDetailOverview: FC<Props> = ({ profile }) => {
  const isClustered = useIsClustered();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const onFailure = (title: string, e: unknown) => {
    notify.failure(title, e);
  };

  const updateContentHeight = () => {
    updateMaxHeight("profile-overview-tab");
  };
  useEffect(updateContentHeight, []);
  useListener(window, updateContentHeight, "resize", true);

  const hasCloudInit =
    profile.config["cloud-init.user-data"] ||
    profile.config["cloud-init.vendor-data"] ||
    profile.config["cloud-init.network-config"];

  const isDefaultProject = project === "default";
  const usageCount = getProfileInstances(
    project,
    isDefaultProject,
    profile.used_by,
  ).length;

  return (
    <div className="profile-overview-tab">
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">Name</th>
                <td>
                  <ItemName item={profile} />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Description</th>
                <td>{profile.description ? profile.description : "-"}</td>
              </tr>
              {isClustered && (
                <tr>
                  <th className="u-text--muted">Placement group</th>
                  <td>
                    {profile.config["placement.group"] ? (
                      <ResourceLink
                        type="placement-group"
                        value={profile.config["placement.group"]}
                        to={`/ui/project/${project}/placement-groups`}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Col>
      </Row>

      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--5">Networks</h2>
        </Col>
        <Col size={7}>
          <NetworkListTable devices={profile.devices} onFailure={onFailure} />
        </Col>
      </Row>
      <Row className="devices">
        <Col size={3}>
          <h2 className="p-heading--5">Devices</h2>
        </Col>
        <Col size={7}>
          <DeviceListTable
            configBaseURL={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(profile.name)}/configuration`}
            devices={profile.devices}
          />
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">Limits</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">CPU</th>
                <td>{profile.config["limits.cpu"] || "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Memory</th>
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
          <h2 className="p-heading--5">Cloud init</h2>
        </Col>
        <Col size={7} className="view-config">
          <Link
            to={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(profile.name)}/configuration/${slugify(CLOUD_INIT)}`}
          >
            View configuration
          </Link>
        </Col>
      </Row>
      <Row className="usage list-wrapper">
        <Col size={3}>
          <h2 className="p-heading--5">Usage ({usageCount})</h2>
        </Col>
        <Col size={7}>
          {usageCount > 0 ? (
            <table>
              <tbody>
                <ProfileInstances
                  profile={profile}
                  project={project}
                  headingClassName="u-text--muted"
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
