import { useMemo, type FC } from "react";
import { Link } from "react-router-dom";
import {
  DoughnutChart,
  Icon,
  List,
  MainTable,
  Spinner,
} from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import { useInstances } from "context/useInstances";
import { useProjects } from "context/useProjects";
import InstanceExplanationTooltip from "pages/instances/InstanceExplanationTooltip";
import InstanceStatus from "pages/instances/InstanceStatus";
import { useProjectEntitlements } from "util/entitlements/projects";
import { capitalizeFirstLetter, pluralize } from "util/helpers";
import { getDefaultProject } from "util/loginProject";
import {
  getInstanceDistribution,
  getInstanceStatusSegments,
  getInstanceStatusFilterUrl,
  OVERVIEW_INSTANCE_STATUSES,
  type InstanceDistribution,
} from "util/overviewInstances";
import { ALL_PROJECTS, getInstancesUrl } from "util/projects";
import CardEmptyState from "./CardEmptyState";
import { renderOverviewCard } from "util/overview";

const InstancesCard: FC = () => {
  const { project, projectName } = useCurrentProject();
  const isAllProjects = projectName === ALL_PROJECTS;
  const {
    data: instances = [],
    error,
    isLoading,
  } = useInstances(isAllProjects ? null : projectName);
  const { canCreateInstances } = useProjectEntitlements();
  const { data: projects = [] } = useProjects();

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
        {!isLoading &&
          !error &&
          instances.length > 0 &&
          ` (${instances.length})`}
      </span>
      <InstanceExplanationTooltip />
    </>
  );
  const instancesUrl = getInstancesUrl(projectName);
  const footerLink = <Link to={instancesUrl}>Instances list</Link>;

  if (isLoading) {
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <Spinner className="u-loader" text="Loading instances..." />,
      footerLink,
    );
  }

  if (error) {
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <>
        <Icon name="error" className="margin-right--large" /> Error while
        loading instances: {error.message}
      </>,
      footerLink,
    );
  }

  if (instances.length === 0) {
    const defaultProjectName = getDefaultProject(projects);
    const defaultProject = projects.find(
      (project) => project.name === defaultProjectName,
    );
    const projectForCreation = isAllProjects ? defaultProject : project;
    const createInstancesUrl = getInstancesUrl(
      projectForCreation?.name ?? "default",
    );
    const canCreate = canCreateInstances(projectForCreation);

    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <CardEmptyState
        title="No instances found"
        subtitle={
          canCreate && (
            <>
              Create an instance on the{" "}
              <Link to={createInstancesUrl}>instances list</Link> page
            </>
          )
        }
      />,
      footerLink,
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
              to={getInstanceStatusFilterUrl(status, instancesUrl)}
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

  return renderOverviewCard(
    cardClassName,
    cardTitle,
    <>
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
            {
              content: "Status",
              className: "overview-card-subtitle status-header",
            },
            {
              content: "Instances",
              className: "overview-card-subtitle u-align--right",
            },
          ]}
          rows={rows}
          responsive
        />
      </div>
    </>,
    footerLink,
  );
};

export default InstancesCard;
