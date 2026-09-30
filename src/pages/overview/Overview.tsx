import { type FC } from "react";
import { CustomLayout } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ClusteringCard from "pages/overview/ClusteringCard";
import InstancesCard from "pages/overview/InstancesCard";
import ProjectsCard from "pages/overview/ProjectsCard";
import StorageCard from "pages/overview/StorageCard";
import PermissionsCard from "pages/overview/PermissionsCard";
import WarningsCard from "pages/overview/WarningsCard";

const Overview: FC = () => {
  const isMobileAndTablet = useIsScreenBelow(1091);

  return (
    <CustomLayout mainClassName="overview" contentClassName="overview-content">
      <div className="overview-columns">
        {isMobileAndTablet ? (
          <div className="overview-column">
            <PermissionsCard />
            <ProjectsCard />
            <ClusteringCard />
            <InstancesCard />
            <StorageCard />
            <WarningsCard />
          </div>
        ) : (
          <>
            <div className="overview-column">
              <ProjectsCard />
              <ClusteringCard />
              <WarningsCard />
            </div>
            <div className="overview-column">
              <PermissionsCard />
              <InstancesCard />
              <StorageCard />
            </div>
          </>
        )}
      </div>
    </CustomLayout>
  );
};

export default Overview;
