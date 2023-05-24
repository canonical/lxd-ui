import React, { FC, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { List, Tabs } from "@canonical/react-components";
import ImageName from "pages/images/ImageName";
import { LxdStoragePool } from "types/storage";
import { filterUsedByType, LxdUsedBy } from "util/usedBy";
import InstanceLink from "pages/instances/InstanceLink";

interface Props {
  storage: LxdStoragePool;
  project: string;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const IMAGES = "Images";
const SNAPSHOTS = "Snapshots";
const TABS = [INSTANCES, PROFILES, IMAGES, SNAPSHOTS];

const StorageUsedBy: FC<Props> = ({ storage, project }) => {
  const [activeTab, setActiveTab] = useState(INSTANCES);

  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instances", project, storage.used_by),
    [PROFILES]: filterUsedByType("profiles", project, storage.used_by),
    [IMAGES]: filterUsedByType("images", project, storage.used_by),
    [SNAPSHOTS]: filterUsedByType("snapshots", project, storage.used_by),
  };

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
                <InstanceLink instance={item} />
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
                <Link
                  to={`/ui/project/${item.project}/profiles/detail/${item.name}`}
                >
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
                  to={`/ui/project/${item.project}/instances/detail/${item.instance}/snapshots`}
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
