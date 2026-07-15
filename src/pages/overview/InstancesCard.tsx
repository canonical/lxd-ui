import { useMemo, type FC } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  DoughnutChart,
  Icon,
  Spinner,
} from "@canonical/react-components";
import ChartLegend from "components/ChartLegend";
import { useInstances } from "context/useInstances";
import InstanceEmptyState from "pages/instances/InstanceEmptyState";
import InstancesOverviewStatus from "pages/overview/InstancesOverviewStatus";
import type { LxdInstance } from "types/instance";
import { pluralize } from "util/helpers";
import {
  getInstanceDistribution,
  type InstanceDistribution,
} from "util/overviewInstances";
import { ROOT_PATH } from "util/rootPath";

const InstancesCard: FC = () => {
  const { data, error, isLoading } = useInstances(null);
  const instances: LxdInstance[] = data ?? [];

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
    <>
      <Icon name="pods" /> Instances
      {!isLoading && !error && instances.length > 0 && ` (${instances.length})`}
    </>
  );
  const vmColor = "#C5C5C5";
  const containerColor = "#636363";

  const getTypeFilterHref = (type: "VM" | "Container") => {
    const params = new URLSearchParams();
    params.append("type", type);
    return `${ROOT_PATH}/ui/all-projects/instances?${params.toString()}`;
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
        <Icon name="error" className="margin-right--large" /> Error while
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
          <InstancesOverviewStatus status="running" count={runningCount} />
          <InstancesOverviewStatus status="stopped" count={stoppedCount} />
          <InstancesOverviewStatus status="frozen" count={frozenCount} />
          <InstancesOverviewStatus status="error" count={errorCount} />
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
        <Link to={`${ROOT_PATH}/ui/all-projects/instances`}>See more</Link>
      </div>
    </Card>
  );
};

export default InstancesCard;
