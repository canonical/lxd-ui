import React, { FC } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "api/profiles";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import EditProfileBtn from "./actions/EditProfileBtn";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { queryKeys } from "util/queryKeys";
import useNotification from "util/useNotification";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  List,
  Row,
} from "@canonical/react-components";
import { isDiskDevice, isNicDevice } from "util/devices";
import Loader from "components/Loader";

const ProfileDetail: FC = () => {
  const notify = useNotification();
  const { name } = useParams<{ name: string }>();
  const { project } = useParams<{
    project: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: profile,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, name],
    queryFn: () => fetchProfile(name, project),
  });

  if (error) {
    notify.failure("Could not load profile details.", error);
  }

  if (isLoading) {
    return <Loader text="Loading profile details..." />;
  } else if (!profile) {
    return <>Could not load profile details.</>;
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
    <BaseLayout
      title={`Profile details for ${name}`}
      controls={
        <>
          <EditProfileBtn profile={profile} project={project} />
          {profile.name !== "default" && (
            <DeleteProfileBtn
              profile={profile}
              project={project}
              notify={notify}
            />
          )}
        </>
      }
    >
      <NotificationRow notify={notify} />
      <Row>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <td>{profile.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{profile.description !== "" ? profile.description : "-"}</td>
            </tr>
            <tr>
              <th>Instances using this profile</th>
              <td>
                {usedByNames?.length ? (
                  <List
                    className="u-no-margin--bottom"
                    items={usedByNames.map((name) => (
                      <Link key={name} to={`/ui/${project}/instances/${name}`}>
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
              <th>Network devices</th>
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
              <th>Storage devices</th>
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
              <th>Memory limit</th>
              <td>{profile.config["limits.memory"] || "-"}</td>
            </tr>
            <tr>
              <th>CPU limit</th>
              <td>{profile.config["limits.cpu"] || "-"}</td>
            </tr>
            <tr>
              <th>cloud-init config</th>
              <td>
                {profile.config["cloud-init.user-data"] && (
                  <Row>
                    <h5>
                      <code>cloud-init.user-data</code>
                    </h5>
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
                    <h5>
                      <code>cloud-init.vendor-data</code>
                    </h5>
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
                    <h5>
                      <code>cloud-init.network-config</code>
                    </h5>
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
      </Row>
    </BaseLayout>
  );
};

export default ProfileDetail;
