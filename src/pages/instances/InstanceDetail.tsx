import React, { FC } from "react";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useNavigate, useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import EditInstanceForm from "./EditInstanceForm";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";
import { slugify } from "util/slugify";
import NotificationRow from "components/NotificationRow";

const TABS: string[] = [
  "Overview",
  "Configuration",
  "Snapshots",
  "Terminal",
  "Console",
  "Logs",
];

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
      navigate(`/ui/project/${project}/instances/detail/${name}`);
    } else {
      navigate(`/ui/project/${project}/instances/detail/${name}/${newTab}`);
    }
  };

  return (
    <main className="l-main">
      <div className="p-panel instance-detail-page">
        <InstanceDetailHeader
          name={name}
          instance={instance}
          project={project}
        />
        <div className="p-panel__content">
          <NotificationRow />
          {isLoading && <Loader text="Loading instance details..." />}
          {!isLoading && !instance && <>Loading instance failed</>}
          {!isLoading && instance && (
            <Row>
              <Tabs
                links={TABS.map((tab) => ({
                  id: slugify(tab),
                  label: tab,
                  active:
                    slugify(tab) === activeTab ||
                    (tab === "Overview" && !activeTab),
                  onClick: () => handleTabChange(slugify(tab)),
                }))}
              />

              {!activeTab && (
                <div role="tabpanel" aria-labelledby="overview">
                  <InstanceOverview instance={instance} />
                </div>
              )}

              {activeTab === "configuration" && (
                <div role="tabpanel" aria-labelledby="configuration">
                  <EditInstanceForm instance={instance} />
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
