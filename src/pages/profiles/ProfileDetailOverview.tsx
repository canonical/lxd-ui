import React, { FC } from "react";
import { Link, useParams } from "react-router-dom";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  List,
  Row,
} from "@canonical/react-components";
import { isDiskDevice, isNicDevice } from "util/devices";
import { LxdProfile } from "types/profile";
import { createPortal } from "react-dom";

interface Props {
  controlTarget?: HTMLSpanElement | null;
  profile: LxdProfile;
}

const ProfileDetail: FC<Props> = ({ controlTarget, profile }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const usedByNames = profile.used_by?.map(
    (path) => path.split("/").slice(-1)[0]
  );

  const getCloudInitConfig = (
    type: "user-data" | "vendor-data" | "network-config"
  ) => {
    return profile.config[`cloud-init.${type}`].replace("|\n", "");
  };

  return (
    <>
      {controlTarget &&
        createPortal(
          <>
            {profile.name !== "default" && (
              <DeleteProfileBtn profile={profile} project={project} />
            )}
          </>,
          controlTarget
        )}
      <table>
        <tbody>
          <tr>
            <th className="u-text--muted">Name</th>
            <td>{profile.name}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Description</th>
            <td>{profile.description ? profile.description : "-"}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Instances using this profile</th>
            <td>
              {usedByNames?.length ? (
                <List
                  className="u-no-margin--bottom"
                  items={usedByNames.map((name) => (
                    <Link
                      key={name}
                      to={`/ui/${project}/instances/detail/${name}`}
                    >
                      {name}
                    </Link>
                  ))}
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Network devices</th>
            <td>
              {Object.values(profile.devices).some(isNicDevice) ? (
                Object.values(profile.devices)
                  .filter(isNicDevice)
                  .map((device) => (
                    <Row key={device.network}>
                      <Col size={6}>
                        <span>
                          Name in instance:{" "}
                          <b>{device.name ?? device.network}</b>
                        </span>
                      </Col>
                      <Col size={6}>
                        <span>
                          Device: <b>{device.network}</b>
                        </span>
                      </Col>
                    </Row>
                  ))
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Storage devices</th>
            <td>
              {Object.values(profile.devices).some(isDiskDevice) ? (
                Object.values(profile.devices)
                  .filter(isDiskDevice)
                  .map((device) => (
                    <Row key={device.path}>
                      <Col size={6}>
                        <span>
                          Path:{" "}
                          <b>
                            {device.path}
                            {device.path === "/" && <span> (root)</span>}
                          </b>
                        </span>
                      </Col>
                      <Col size={6}>
                        <span>
                          Pool: <b>{device.pool}</b>
                        </span>
                      </Col>
                    </Row>
                  ))
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Memory limit</th>
            <td>{profile.config["limits.memory"] || "-"}</td>
          </tr>
          <tr>
            <th className="u-text--muted">CPU limit</th>
            <td>{profile.config["limits.cpu"] || "-"}</td>
          </tr>
          <tr>
            <th className="u-text--muted">cloud-init config</th>
            <td>
              {profile.config["cloud-init.user-data"] && (
                <Row>
                  <div className="p-heading--5">
                    <code>cloud-init.user-data</code>
                  </div>
                  <CodeSnippet
                    blocks={[
                      {
                        appearance: CodeSnippetBlockAppearance.NUMBERED,
                        code: getCloudInitConfig("user-data"),
                      },
                    ]}
                  />
                </Row>
              )}
              {profile.config["cloud-init.vendor-data"] && (
                <Row>
                  <div className="p-heading--5">
                    <code>cloud-init.vendor-data</code>
                  </div>
                  <CodeSnippet
                    blocks={[
                      {
                        appearance: CodeSnippetBlockAppearance.NUMBERED,
                        code: getCloudInitConfig("vendor-data"),
                      },
                    ]}
                  />
                </Row>
              )}
              {profile.config["cloud-init.network-config"] && (
                <Row>
                  <div className="p-heading--5">
                    <code>cloud-init.network-config</code>
                  </div>
                  <CodeSnippet
                    blocks={[
                      {
                        appearance: CodeSnippetBlockAppearance.NUMBERED,
                        code: getCloudInitConfig("network-config"),
                      },
                    ]}
                  />
                </Row>
              )}
              {!Object.keys(profile.config).some((key) =>
                key.startsWith("cloud-init.")
              ) && <>-</>}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ProfileDetail;
