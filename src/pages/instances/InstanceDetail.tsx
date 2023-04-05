import React, { FC } from "react";
import { Row, Tabs } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useNavigate, useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import NotificationRow from "components/NotificationRow";
import { useNotify } from "context/notify";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import InstanceConfiguration from "pages/instances/InstanceConfiguration";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";

const TABS: string[] = [
  "Overview",
  "Configuration",
  "Snapshots",
  "Terminal",
  "Console",
  "Logs",
];

const tabNameToUrl = (name: string) => {
  return name.replace(" ", "-").toLowerCase();
};

const InstanceDetail: FC = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, name, project],
    queryFn: () => fetchInstance(name, project),
  });

  if (error) {
    notify.failure("Loading instance failed", error);
  }

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/${project}/instances/detail/${name}`);
    } else {
      navigate(`/ui/${project}/instances/detail/${name}/${newTab}`);
    }
  };

  return (
    <main className="l-main">
      <div className="p-panel instance-detail-page">
        <InstanceDetailHeader
          name={name}
          project={project}
          instance={instance}
        />
        <div className="p-panel__content">
          <NotificationRow />
          {isLoading && <Loader text="Loading instance details..." />}
          {!isLoading && !instance && <>Loading instance failed</>}
          {!isLoading && instance && (
            <Row>
              <Tabs
                links={TABS.map((tab) => ({
                  id: tabNameToUrl(tab),
                  label: tab,
                  active:
                    tabNameToUrl(tab) === activeTab ||
                    (tab === "Overview" && !activeTab),
                  onClick: () => handleTabChange(tabNameToUrl(tab)),
                }))}
              />

              {!activeTab && (
                <div role="tabpanel" aria-labelledby="overview">
                  <InstanceOverview instance={instance} />
                </div>
              )}

              {activeTab === "configuration" && (
                <div role="tabpanel" aria-labelledby="configuration">
                  <InstanceConfiguration instance={instance} />
                </div>
              )}

              {activeTab === "snapshots" && (
                <div role="tabpanel" aria-labelledby="snapshots">
                  <InstanceSnapshots instance={instance} />
                </div>
              )}

              {activeTab === "terminal" && (
                <div role="tabpanel" aria-labelledby="terminal">
                  <InstanceTerminal instance={instance} />
                </div>
              )}

              {activeTab === "console" && (
                <div role="tabpanel" aria-labelledby="console">
                  <InstanceConsole instance={instance} />
                </div>
              )}

              {activeTab === "logs" && (
                <div role="tabpanel" aria-labelledby="logs">
                  <InstanceLogs instance={instance} />
                </div>
              )}
            </Row>
          )}
        </div>
      </div>
    </main>
  );
};

export default InstanceDetail;
