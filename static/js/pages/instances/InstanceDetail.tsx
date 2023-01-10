import React, { FC, useState } from "react";
import BaseLayout from "components/BaseLayout";
import { Row, Tabs } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useNavigate, useParams } from "react-router-dom";
import InstanceVga from "./InstanceVga";
import InstanceSnapshots from "./InstanceSnapshots";
import NotificationRow from "components/NotificationRow";
import useNotification from "util/useNotification";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";

const TABS: string[] = ["Overview", "Snapshots", "Terminal", "VGA"];

const InstanceDetail: FC = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const { name, activeTab } = useParams<{
    name: string;
    activeTab?: string;
  }>();
  const [controlTarget, setControlTarget] = useState<HTMLSpanElement | null>();

  if (!name) {
    return <>Missing name</>;
  }

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, name],
    queryFn: () => fetchInstance(name),
  });

  if (error) {
    notify.failure("Could not load instance details.", error);
  }

  if (isLoading) {
    return <Loader text="Loading instance details..." />;
  }

  if (!instance) {
    return <>Could not load instance details.</>;
  }

  const handleTabChange = (newTab: string) => {
    if (newTab === "overview") {
      navigate(`/ui/instances/${name}`);
    } else {
      navigate(`/ui/instances/${name}/${newTab}`);
    }
  };

  return (
    <BaseLayout
      title={`Instance details for ${name}`}
      controls={
        <span id="control-target" ref={(ref) => setControlTarget(ref)} />
      }
    >
      <NotificationRow notify={notify} />
      <Row>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            active:
              tab.toLowerCase() === activeTab ||
              (tab === "Overview" && !activeTab),
            onClick: () => handleTabChange(tab.toLowerCase()),
          }))}
        />

        {!activeTab && (
          <div tabIndex={0} role="tabpanel" aria-labelledby="overview">
            <InstanceOverview
              instance={instance}
              controlTarget={controlTarget}
              notify={notify}
            />
          </div>
        )}

        {activeTab === "snapshots" && (
          <div tabIndex={1} role="tabpanel" aria-labelledby="snapshots">
            <InstanceSnapshots
              instance={instance}
              controlTarget={controlTarget}
              notify={notify}
            />
          </div>
        )}

        {activeTab === "terminal" && (
          <div tabIndex={2} role="tabpanel" aria-labelledby="terminal">
            <InstanceTerminal controlTarget={controlTarget} notify={notify} />
          </div>
        )}

        {activeTab === "vga" && (
          <div tabIndex={3} role="tabpanel" aria-labelledby="vga">
            <InstanceVga controlTarget={controlTarget} notify={notify} />
          </div>
        )}
      </Row>
    </BaseLayout>
  );
};

export default InstanceDetail;
