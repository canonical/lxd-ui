import React, { FC, useState } from "react";
import BaseLayout from "components/BaseLayout";
import { Row, Tabs } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useNavigate, useParams } from "react-router-dom";
import InstanceVga from "./InstanceVga";
import InstanceSnapshots from "./InstanceSnapshots";

const TABS: string[] = ["Overview", "Snapshots", "Terminal", "VGA"];

const InstanceDetail: FC = () => {
  const navigate = useNavigate();
  const { name, activeTab } = useParams<{
    name: string;
    activeTab?: string;
  }>();
  const [controlTarget, setControlTarget] = useState<HTMLSpanElement | null>();

  if (!name) {
    return <>Missing name</>;
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
              instanceName={name}
              controlTarget={controlTarget}
            />
          </div>
        )}

        {activeTab === "snapshots" && (
          <div tabIndex={1} role="tabpanel" aria-labelledby="snapshots">
            <InstanceSnapshots
              instanceName={name}
              controlTarget={controlTarget}
            />
          </div>
        )}

        {activeTab === "terminal" && (
          <div tabIndex={2} role="tabpanel" aria-labelledby="terminal">
            <InstanceTerminal controlTarget={controlTarget} />
          </div>
        )}

        {activeTab === "vga" && (
          <div tabIndex={3} role="tabpanel" aria-labelledby="vga">
            <InstanceVga controlTarget={controlTarget} />
          </div>
        )}
      </Row>
    </BaseLayout>
  );
};

export default InstanceDetail;
