import type { FC } from "react";
import { CustomLayout, Row } from "@canonical/react-components";
import ClusterCard from "pages/overview/ClusterCard";
import InstancesCard from "pages/overview/InstancesCard";
import NetworksCard from "pages/overview/NetworksCard";
import ProjectsCard from "pages/overview/ProjectsCard";
import StorageCard from "pages/overview/StorageCard";
import WarningsCard from "pages/overview/WarningsCard";

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
      </Row>
      <Row>
        <WarningsCard />
        <NetworksCard />
      </Row>
    </CustomLayout>
  );
};

export default Overview;
