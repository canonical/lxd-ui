import type { FC } from "react";
import { Icon, Row, CustomLayout, Spinner } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import EditInstance from "./EditInstance";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";
import TabLinks from "components/TabLinks";
import { useSettings } from "context/useSettings";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useInstance } from "context/useInstances";
import { buildGrafanaUrl } from "util/grafanaUrl";
import NotFound from "components/NotFound";
import { ROOT_PATH } from "util/rootPath";

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
  } = useInstance(name, project);

  const renderTabs: (string | TabLink)[] = [...tabs];

  const grafanaUrl = buildGrafanaUrl(name, project, settings);
  if (grafanaUrl) {
    renderTabs.push({
      label: (
        <div>
          <Icon name="external-link" /> Metrics
        </div>
      ) as unknown as string,
      href: grafanaUrl,
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
      {isLoading && (
        <Spinner
          className="u-loader"
          text="Loading instance details..."
          isMainComponent
        />
      )}
      {!isLoading && !instance && (
        <NotFound
          entityType="instance"
          entityName={name}
          errorMessage={error?.message}
        />
      )}
      {!isLoading && instance && (
        <Row>
          <TabLinks
            tabs={renderTabs}
            activeTab={activeTab}
            tabUrl={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(name)}`}
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
