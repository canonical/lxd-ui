import React, { FC } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { queryKeys } from "util/queryKeys";
import useNotification from "util/useNotification";
import { List, Row } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStorage } from "api/storages";
import StorageSize from "pages/storages/StorageSize";
import ImageName from "pages/images/ImageName";

const StorageDetail: FC = () => {
  const notify = useNotification();
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: storage,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, name],
    queryFn: () => fetchStorage(name, project),
  });

  if (error) {
    notify.failure("Could not load storage details.", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage details..." />;
  } else if (!storage) {
    return <>Could not load storage details.</>;
  }

  const filterUsedByType = (type: string) =>
    storage.used_by
      ?.filter((path) => {
        if (type === "instances" && path.includes("/snapshots/")) {
          return false;
        }

        return path.startsWith(`/1.0/${type}`);
      })
      .map((path) => {
        const name: string = path.split("/").slice(-1)[0] ?? "";
        return {
          name: name.split("?")[0],
          project: name.includes("?project=")
            ? name.split("=").slice(-1)[0]
            : project,
        };
      }) ?? [];

  const usedByInstances = filterUsedByType("instances");
  const usedByProfiles = filterUsedByType("profiles");
  const usedByImages = filterUsedByType("images");

  return (
    <BaseLayout title={`Storage details for ${name}`}>
      <NotificationRow notify={notify} />
      <Row>
        <table>
          <tbody>
            <tr>
              <th className="u-text--muted">Name</th>
              <td>{storage.name}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Status</th>
              <td>{storage.status}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Size</th>
              <td>
                <StorageSize storage={storage} />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Source</th>
              <td>{storage.config?.source ?? "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Description</th>
              <td>{storage.description ? storage.description : "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Driver</th>
              <td>{storage.driver}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Instances using this storage</th>
              <td>
                {usedByInstances.length ? (
                  <List
                    className="u-no-margin--bottom"
                    items={usedByInstances.map((item) => (
                      <Link
                        key={item.project}
                        to={`/ui/${item.project}/instances/${item.name}`}
                      >
                        {item.name}
                        {item.project !== project &&
                          ` (project ${item.project})`}
                      </Link>
                    ))}
                  />
                ) : (
                  <>-</>
                )}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Profiles using this storage</th>
              <td>
                {usedByProfiles.length ? (
                  <List
                    className="u-no-margin--bottom"
                    items={usedByProfiles.map((item) => (
                      <Link
                        key={item.name}
                        to={`/ui/${item.project}/profiles/${item.name}`}
                      >
                        {item.name}
                        {item.project !== project &&
                          ` (project ${item.project})`}
                      </Link>
                    ))}
                  />
                ) : (
                  <>-</>
                )}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Images using this storage</th>
              <td>
                {usedByImages.length ? (
                  <List
                    className="u-no-margin--bottom"
                    items={usedByImages.map((item) => (
                      <ImageName
                        key={item.name}
                        id={item.name}
                        project={item.project}
                      />
                    ))}
                  />
                ) : (
                  <>-</>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </Row>
    </BaseLayout>
  );
};

export default StorageDetail;
