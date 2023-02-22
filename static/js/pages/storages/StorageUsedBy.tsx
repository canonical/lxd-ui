import React, { FC, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { List, Tabs } from "@canonical/react-components";
import ImageName from "pages/images/ImageName";
import { LxdStorage } from "types/storage";

interface UsedByType {
  name: string;
  project: string;
  instance: string;
}

interface Props {
  storage: LxdStorage;
  project: string;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const IMAGES = "Images";
const SNAPSHOTS = "Snapshots";
const TABS = [INSTANCES, PROFILES, IMAGES, SNAPSHOTS];

const StorageUsedBy: FC<Props> = ({ storage, project }) => {
  const [activeTab, setActiveTab] = useState(INSTANCES);

  const filterUsedByType = (type: string) =>
    storage.used_by
      ?.filter((path) => {
        if (type === "instances" && path.includes("/snapshots/")) {
          return false;
        }

        if (type === "snapshots") {
          return path.includes("/snapshots/");
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
          instance: type === "snapshots" ? path.split("/")[3] : "",
        };
      }) ?? [];

  const data: Record<string, UsedByType[]> = {
    [INSTANCES]: filterUsedByType("instances"),
    [PROFILES]: filterUsedByType("profiles"),
    [IMAGES]: filterUsedByType("images"),
    [SNAPSHOTS]: filterUsedByType("snapshots"),
  };

  data[INSTANCES].sort((a, b) => {
    return a.project < b.project
      ? -1
      : a.project > b.project
      ? 1
      : a.name < b.name
      ? -1
      : a.name > b.name
      ? 1
      : 0;
  });

  return (
    <>
      <Tabs
        links={TABS.map((tab) => ({
          label: `${tab} (${data[tab].length})`,
          active: tab === activeTab,
          onClick: () => setActiveTab(tab),
        }))}
      />

      {activeTab === INSTANCES &&
        (data[INSTANCES].length ? (
          <List
            className="u-no-margin--bottom"
            items={data[INSTANCES].map((item) => (
              <Fragment key={item.name}>
                <Link to={`/ui/${item.project}/instances/${item.name}`}>
                  {item.name}
                </Link>
                {item.project !== project && ` (project ${item.project})`}
              </Fragment>
            ))}
          />
        ) : (
          <>None</>
        ))}

      {activeTab === PROFILES &&
        (data[PROFILES].length ? (
          <List
            className="u-no-margin--bottom"
            items={data[PROFILES].map((item) => (
              <Fragment key={item.name}>
                <Link to={`/ui/${item.project}/profiles/${item.name}`}>
                  {item.name}
                </Link>
                {item.project !== project && ` (project ${item.project})`}
              </Fragment>
            ))}
          />
        ) : (
          <>None</>
        ))}

      {activeTab === IMAGES &&
        (data[IMAGES].length ? (
          <List
            className="u-no-margin--bottom"
            items={data[IMAGES].map((item) => (
              <ImageName
                key={item.name}
                id={item.name}
                project={item.project}
              />
            ))}
          />
        ) : (
          <>None</>
        ))}

      {activeTab === SNAPSHOTS &&
        (data[SNAPSHOTS].length ? (
          <List
            className="u-no-margin--bottom"
            items={data[SNAPSHOTS].map((item) => (
              <Fragment key={item.name}>
                <Link
                  to={`/ui/${item.project}/instances/${item.instance}/snapshots`}
                >
                  {`${item.instance} ${item.name}`}
                </Link>
                {item.project !== project && ` (project ${item.project})`}
              </Fragment>
            ))}
          />
        ) : (
          <>None</>
        ))}
    </>
  );
};

export default StorageUsedBy;
