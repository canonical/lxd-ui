import type { FC } from "react";
import { CustomLayout, Row } from "@canonical/react-components";
import ClusterCard from "pages/overview/ClusterCard";
import InstancesCard from "pages/overview/InstancesCard";
import NetworkingCard from "pages/overview/NetworkingCard";
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
        <ClusterCard />
      </Row>
      <Row className="overview-row">
        <ProjectsCard />
        <StorageCard />
      </Row>
      <Row>
        <WarningsCard />
        <NetworkingCard />
      </Row>
    </CustomLayout>
  );
};

export default Overview;
