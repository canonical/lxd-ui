import { useMemo, type FC } from "react";
import { Link } from "react-router-dom";
import { Card, DoughnutChart, Spinner } from "@canonical/react-components";
import ChartLegend from "components/ChartLegend";
import { useCurrentProject } from "context/useCurrentProject";
import { useInstances } from "context/useInstances";
import InstanceEmptyState from "pages/instances/InstanceEmptyState";
import InstancesOverviewStatus from "pages/overview/InstancesOverviewStatus";
import { pluralize } from "util/helpers";
import {
  getInstanceDistribution,
  type InstanceDistribution,
} from "util/overviewInstances";
import { ALL_PROJECTS, getInstancesUrl } from "util/projects";
import DsIcon from "components/DsIcon";

const InstancesCard: FC = () => {
  const { projectName } = useCurrentProject();
  const isAllProjects = projectName === ALL_PROJECTS;
  const {
    data: instances = [],
    error,
    isLoading,
  } = useInstances(isAllProjects ? null : projectName);

  const {
    runningCount,
    stoppedCount,
    frozenCount,
    errorCount,
    containerCount,
    virtualMachineCount,
  } = useMemo<InstanceDistribution>(
    () => getInstanceDistribution(instances),
    [instances],
  );

  const cardClassName = "overview-card instances";
  const cardTitle = (
    <span className="overview-card-title">
      <DsIcon icon="pods" /> Instances
      {!isLoading && !error && instances.length > 0 && ` (${instances.length})`}
    </span>
  );
  const vmColor = "#C5C5C5";
  const containerColor = "#636363";
  const instancesUrl = getInstancesUrl(projectName);

  const getTypeFilterHref = (type: "VM" | "Container") => {
    const params = new URLSearchParams();
    params.append("type", type);
    return `${instancesUrl}?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading instances..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <DsIcon icon="error-fill" className="margin-right--large" /> Error while
        loading instances: {error.message}
      </Card>
    );
  }

  if (instances.length === 0) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <InstanceEmptyState className="u-no-margin" />
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <div className="card-content">
        <div className="group-by-status-container">
          <InstancesOverviewStatus
            status="running"
            count={runningCount}
            instancesUrl={instancesUrl}
          />
          <InstancesOverviewStatus
            status="stopped"
            count={stoppedCount}
            instancesUrl={instancesUrl}
          />
          <InstancesOverviewStatus
            status="frozen"
            count={frozenCount}
            instancesUrl={instancesUrl}
          />
          <InstancesOverviewStatus
            status="error"
            count={errorCount}
            instancesUrl={instancesUrl}
          />
        </div>

        <div className="group-by-type-container">
          <DoughnutChart
            segments={[
              {
                color: vmColor,
                tooltip: `${virtualMachineCount} VMs`,
                value: virtualMachineCount,
                href: getTypeFilterHref("VM"),
              },
              {
                color: containerColor,
                tooltip: `${containerCount} containers`,
                value: containerCount,
                href: getTypeFilterHref("Container"),
              },
            ]}
            size={150}
            segmentHoverWidth={45}
            segmentThickness={40}
            chartID="dashboard-instances-by-type-doughnut-chart"
            className="group-by-type-doughnut-chart"
          />
          <ChartLegend
            items={[
              {
                color: vmColor,
                label: `${virtualMachineCount} ${pluralize("VM", virtualMachineCount)}`,
              },
              {
                color: containerColor,
                label: `${containerCount} ${pluralize("container", containerCount)}`,
              },
            ]}
          />
        </div>
      </div>

      <div className="card-footer">
        <Link to={instancesUrl}>Instances list</Link>
      </div>
    </Card>
  );
};

export default InstancesCard;
