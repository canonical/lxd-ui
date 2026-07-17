import type { FC } from "react";
import { CustomLayout, Row } from "@canonical/react-components";
import ClusterCard from "pages/overview/ClusterCard";
import InstancesCard from "pages/overview/InstancesCard";
import ProjectsCard from "pages/overview/ProjectsCard";
import MemoryCard from "pages/overview/MemoryCard";
import StorageCard from "pages/overview/StorageCard";
import NetworksCard from "pages/overview/NetworksCard";
import WarningCard from "pages/overview/WarningCard";

const Overview: FC = () => {
  return (
    <CustomLayout mainClassName="overview" contentClassName="overview-content">
      <Row className="overview-row">
        <InstancesCard />
        <ClusterCard />
      </Row>
      <Row className="overview-row">
        <ProjectsCard />
        <StorageCard />
        {/* <MemoryCard /> */}
      </Row>
      <Row>
        {/* <NetworksCard /> */}
        <WarningCard />
      </Row>
    </CustomLayout>
  );
};

export default Overview;
