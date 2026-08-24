import type { FC } from "react";
import { CustomLayout } from "@canonical/react-components";
import ClusteringCard from "pages/overview/ClusteringCard";
import InstancesCard from "pages/overview/InstancesCard";
import ProjectsCard from "pages/overview/ProjectsCard";
import StorageCard from "pages/overview/StorageCard";
import PermissionsCard from "pages/overview/PermissionsCard";
import WarningsCard from "pages/overview/WarningsCard";

const Overview: FC = () => {
  return (
    <CustomLayout mainClassName="overview" contentClassName="overview-content">
      <div className="overview-columns">
        <div className="overview-column">
          <PermissionsCard />
          <ProjectsCard />
          <ClusteringCard />
          <WarningsCard />
        </div>
        <div className="overview-column">
          <InstancesCard />
          <StorageCard />
        </div>
      </div>
    </CustomLayout>
  );
};

export default Overview;
