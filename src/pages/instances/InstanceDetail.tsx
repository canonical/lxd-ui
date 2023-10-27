import React, { FC } from "react";
import { Row, useNotify } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import EditInstance from "./EditInstance";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";

const tabs: string[] = [
  "Overview",
  "Configuration",
  "Snapshots",
  "Terminal",
  "Console",
  "Logs",
];

const InstanceDetail: FC = () => {
  const notify = useNotify();
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

  return (
    <CustomLayout
      header={
        <InstanceDetailHeader
          name={name}
          instance={instance}
          project={project}
        />
      }
      contentClassName="detail-page"
    >
      <NotificationRow />
      {isLoading && <Loader text="Loading instance details..." />}
      {!isLoading && !instance && <>Loading instance failed</>}
      {!isLoading && instance && (
        <Row>
          <TabLinks
            tabs={tabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${project}/instances/detail/${name}`}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="overview">
              <InstanceOverview instance={instance} />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="configuration">
              <EditInstance instance={instance} />
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
    </CustomLayout>
  );
};

export default InstanceDetail;
