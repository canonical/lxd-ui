import { useMemo, type FC } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  DoughnutChart,
  Icon,
  List,
  MainTable,
  Spinner,
} from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import { useInstances } from "context/useInstances";
import InstanceEmptyState from "pages/instances/InstanceEmptyState";
import InstanceExplanationTooltip from "pages/instances/InstanceExplanationTooltip";
import InstanceStatus from "pages/instances/InstanceStatus";
import { capitalizeFirstLetter, pluralize } from "util/helpers";
import {
  getInstanceDistribution,
  getInstanceStatusSegments,
  getInstanceStatusFilterHref,
  OVERVIEW_INSTANCE_STATUSES,
  type InstanceDistribution,
} from "util/overviewInstances";
import { ALL_PROJECTS, getInstancesUrl } from "util/projects";

const InstancesCard: FC = () => {
  const { projectName } = useCurrentProject();
  const isAllProjects = projectName === ALL_PROJECTS;
  const {
    data: instances = [],
    error,
    isLoading,
  } = useInstances(isAllProjects ? null : projectName);

  const distribution = useMemo<InstanceDistribution>(
    () => getInstanceDistribution(instances),
    [instances],
  );
  const {
    containerCount,
    virtualMachineCount,
    status: statusCounts,
  } = distribution;

  const cardClassName = "overview-card instances";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <Icon name="pods" /> Instances
        {!isLoading && !error && ` (${instances.length})`}
      </span>
      <InstanceExplanationTooltip />
    </>
  );
  const instancesUrl = getInstancesUrl(projectName);

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

  const segments = getInstanceStatusSegments(statusCounts, instancesUrl);

  const rows = OVERVIEW_INSTANCE_STATUSES.map((status) => {
    return {
      key: status,
      name: status,
      className: "u-row",
      columns: [
        {
          content: <InstanceStatus status={capitalizeFirstLetter(status)} />,
          role: "rowheader",
          "aria-label": "Status",
        },
        {
          content: (
            <Link
              className="status-link p-link--soft"
              to={getInstanceStatusFilterHref(status, instancesUrl)}
            >
              {statusCounts[status]}
            </Link>
          ),
          className: "u-align--right",
          "aria-label": "Instances",
        },
      ],
    };
  });

  return (
    <Card className={cardClassName} title={cardTitle}>
      <List
        inline
        middot
        items={[
          `${virtualMachineCount} ${pluralize("VM", virtualMachineCount)}`,
          `${containerCount} ${pluralize("container", containerCount)}`,
        ]}
        className="u-no-margin--bottom"
      />

      <div className="card-content">
        <div className="group-by-status-chart">
          <p className="chart-title">Instances by status</p>
          <DoughnutChart
            segments={segments}
            size={150}
            segmentHoverWidth={45}
            segmentThickness={40}
            chartID="dashboard-instances-by-status-doughnut-chart"
            className="group-by-status-doughnut-chart"
          />
        </div>

        <MainTable
          className="overview-table group-by-status-table"
          aria-label="Instances by status"
          headers={[
            { content: "Status", className: "overview-card-subtitle" },
            {
              content: "Instances",
              className: "u-align--right overview-card-subtitle",
            },
          ]}
          rows={rows}
          responsive
        />
      </div>

      <div className="card-footer">
        <Link to={instancesUrl}>Instances list</Link>
      </div>
    </Card>
  );
};

export default InstancesCard;
