import { FC } from "react";
import { Icon, Notification, Row, Strip } from "@canonical/react-components";
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
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";
import { useSettings } from "context/useSettings";
import { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";

const tabs: string[] = [
  "Overview",
  "Configuration",
  "Snapshots",
  "Terminal",
  "Console",
  "Logs",
];

const InstanceDetail: FC = () => {
  const { data: settings } = useSettings();

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
    refetch: refreshInstance,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, name, project],
    queryFn: () => fetchInstance(name, project),
  });

  const renderTabs: (string | TabLink)[] = [...tabs];

  const grafanaBaseUrl = settings?.config?.["user.grafana_base_url"] ?? "";
  if (grafanaBaseUrl) {
    renderTabs.push({
      label: (
        <div>
          <Icon name="external-link" /> Metrics
        </div>
      ) as unknown as string,
      href: `${grafanaBaseUrl}&var-job=lxd&var-project=${project}&var-name=${instance?.name}&var-top=5`,
      target: "_blank",
      rel: "noopener noreferrer",
    });
  }

  return (
    <CustomLayout
      header={
        <InstanceDetailHeader
          name={name}
          instance={instance}
          project={project}
          isLoading={isLoading}
        />
      }
      contentClassName="detail-page"
    >
      {isLoading && <Loader text="Loading instance details..." />}
      {!isLoading && !instance && !error && <>Loading instance failed</>}
      {error && (
        <Strip>
          <Notification severity="negative" title="Error">
            {error.message}
          </Notification>
        </Strip>
      )}
      {!isLoading && instance && (
        <Row>
          <TabLinks
            tabs={renderTabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${project}/instance/${name}`}
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
              <InstanceTerminal
                instance={instance}
                refreshInstance={refreshInstance}
              />
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
