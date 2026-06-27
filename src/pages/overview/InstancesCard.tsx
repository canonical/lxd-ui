import { useMemo, type FC } from "react";
import {
  Card,
  DoughnutChart,
  Icon,
  Link,
  Spinner,
} from "@canonical/react-components";
import { useInstances } from "context/useInstances";
import InstanceEmptyState from "pages/instances/InstanceEmptyState";
import type { LxdInstance, LxdInstanceStatus } from "types/instance";
import { capitalizeFirstLetter } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";

interface InstancesOverviewStatusProps {
  status: "running" | "stopped" | "pending" | "error";
  instances: LxdInstance[];
}

const InstancesOverviewStatus: FC<InstancesOverviewStatusProps> = ({
  status,
  instances,
}) => {
  return (
    <div className={`group-by-status ${status}`}>
      <p className="status-label u-text--muted">
        {capitalizeFirstLetter(status)}
      </p>
      <strong className="status-count">{instances.length}</strong>
    </div>
  );
};

interface InstanceAccumulator {
  runningInstances: LxdInstance[];
  stoppedInstances: LxdInstance[];
  pendingInstances: LxdInstance[];
  errorInstances: LxdInstance[];
  containers: LxdInstance[];
  virtualMachines: LxdInstance[];
}

const PENDING_STATUSES = new Set<LxdInstanceStatus>([
  "Restarting",
  "Starting",
  "Stopping",
  "Migrating",
]);
const ERROR_STATUSES = new Set<LxdInstanceStatus>([
  "Error",
  "Freezing",
  "Frozen",
]);

const INITIAL_ACCUMULATOR: InstanceAccumulator = {
  runningInstances: [],
  stoppedInstances: [],
  pendingInstances: [],
  errorInstances: [],
  containers: [],
  virtualMachines: [],
};

const InstancesCard: FC = () => {
  const { data: instances = [], error, isLoading } = useInstances(null);

  const {
    runningInstances,
    stoppedInstances,
    pendingInstances,
    errorInstances,
    containers,
    virtualMachines,
  } = useMemo(() => {
    if (instances.length === 0) {
      return INITIAL_ACCUMULATOR;
    }

    return instances.reduce<InstanceAccumulator>(
      (accumulator, instance) => {
        const { status, type } = instance;

        if (status === "Running") {
          accumulator.runningInstances.push(instance);
        } else if (status === "Stopped") {
          accumulator.stoppedInstances.push(instance);
        } else if (PENDING_STATUSES.has(status)) {
          accumulator.pendingInstances.push(instance);
        } else if (ERROR_STATUSES.has(status)) {
          accumulator.errorInstances.push(instance);
        }

        if (type === "container") {
          accumulator.containers.push(instance);
        } else if (type === "virtual-machine") {
          accumulator.virtualMachines.push(instance);
        }

        return accumulator;
      },
      {
        runningInstances: [],
        stoppedInstances: [],
        pendingInstances: [],
        errorInstances: [],
        containers: [],
        virtualMachines: [],
      },
    );
  }, [instances]);

  const cardClassName = "overview-card instances";
  const cardTitle = (
    <Link soft href={`${ROOT_PATH}/ui/all-projects/instances`}>
      <Icon name="pods" /> Instances
      {!isLoading && !error && instances.length > 0 && ` (${instances.length})`}
    </Link>
  );
  const vmColor = "#C5C5C5";
  const containerColor = "#636363";

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
        <div className="error-message">
          <Icon name="error" className="margin-right--large" /> Error while
          loading instances: {error.message}
        </div>
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
      <div className="group-by-status-container">
        <div className="mobile-row">
          <InstancesOverviewStatus
            status="running"
            instances={runningInstances}
          />
          <InstancesOverviewStatus
            status="stopped"
            instances={stoppedInstances}
          />
        </div>
        <div className="mobile-row">
          <InstancesOverviewStatus
            status="pending"
            instances={pendingInstances}
          />
          <InstancesOverviewStatus status="error" instances={errorInstances} />
        </div>
      </div>

      <div className="group-by-type-container">
        <DoughnutChart
          segments={[
            {
              color: vmColor,
              tooltip: `${virtualMachines.length} VMs`,
              value: virtualMachines.length,
            },
            {
              color: containerColor,
              tooltip: `${containers.length} containers`,
              value: containers.length,
            },
          ]}
          size={150}
          segmentHoverWidth={45}
          segmentThickness={40}
          chartID="dashboard-instances-by-type-doughnut-chart"
          className="group-by-type-doughnut-chart"
        />
        <span>
          <span
            className="dot"
            style={{
              backgroundColor: vmColor,
            }}
          ></span>
          {virtualMachines.length} VMs &nbsp;| &nbsp;
          <span
            className="dot"
            style={{
              backgroundColor: containerColor,
            }}
          ></span>
          {containers.length} containers
        </span>
      </div>
    </Card>
  );
};

export default InstancesCard;
