import type { FC } from "react";
import { CustomLayout, Row } from "@canonical/react-components";
import ClusteringCard from "pages/overview/ClusteringCard";
import InstancesCard from "pages/overview/InstancesCard";
import NetworksCard from "pages/overview/NetworksCard";
import ProjectsCard from "pages/overview/ProjectsCard";
import StorageCard from "pages/overview/StorageCard";
import PermissionsCard from "pages/overview/PermissionsCard";
import WarningsCard from "pages/overview/WarningsCard";

const Overview: FC = () => {
  return (
    <CustomLayout mainClassName="overview" contentClassName="overview-content">
      <PermissionsCard />
      <Row className="overview-row">
        <InstancesCard />
        <ClusteringCard />
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
