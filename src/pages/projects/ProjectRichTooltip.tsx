import { type FC } from "react";
import { useProject } from "context/useProjects";
import { List, Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import {
  LARGE_TOOLTIP_BREAKPOINT,
  MEDIUM_TOOLTIP_BREAKPOINT,
  RichTooltipTable,
} from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import { useProfile } from "context/useProfiles";
import { isProjectWithProfiles } from "util/projects";
import { getDefaultStoragePool, getDefaultNetwork } from "util/helpers";
import ResourceLink from "components/ResourceLink";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  projectName: string;
}

const ProjectRichTooltip: FC<Props> = ({ projectName }) => {
  const { data: project, isLoading: isProjectLoading } =
    useProject(projectName);
  const { data: defaultProfile, isLoading: isDefaultProfileLoading } =
    useProfile("default", projectName);
  const { hasProjectsNetworksZones, hasStorageBuckets } =
    useSupportedFeatures();
  const isAboveMedium = !useIsScreenBelow(MEDIUM_TOOLTIP_BREAKPOINT, "height");
  const isAboveLarge = !useIsScreenBelow(LARGE_TOOLTIP_BREAKPOINT, "height");

  const isLoading = isProjectLoading || isDefaultProfileLoading;

  if (!project && !isLoading) {
    return (
      <>
        Project <ResourceLabel type="project" value={projectName} bold /> not
        found
      </>
    );
  }

  const projectDescription = project?.description || "-";
  const defaultStoragePool = defaultProfile
    ? getDefaultStoragePool(defaultProfile)
    : "";
  const defaultNetwork = defaultProfile
    ? getDefaultNetwork(defaultProfile)
    : "none";
  const isRestricted = project?.config?.restricted === "true";

  const featuresImages = project?.config?.["features.images"] === "true";
  const featuresProfiles = isProjectWithProfiles(project);
  const featuresNetworks = project?.config?.["features.networks"] === "true";
  const featuresNetworksZones =
    project?.config?.["features.networks.zones"] === "true";
  const featuresStorageBuckets =
    project?.config?.["features.storage.buckets"] === "true";
  const featuresStorageVolumes =
    project?.config?.["features.storage.volumes"] === "true";

  const isolatedFeatures: string[] = [];
  if (featuresImages) {
    isolatedFeatures.push("Images");
  }
  if (featuresProfiles) {
    isolatedFeatures.push("Profiles");
  }
  if (featuresNetworks) {
    isolatedFeatures.push("Networks");
  }
  if (hasProjectsNetworksZones && featuresNetworksZones) {
    isolatedFeatures.push("Network zones");
  }
  if (hasStorageBuckets && featuresStorageBuckets) {
    isolatedFeatures.push("Storage buckets");
  }
  if (featuresStorageVolumes) {
    isolatedFeatures.push("Storage volumes");
  }

  const instanceLimits: string[] = [];
  const computeLimits: string[] = [];
  const storageNetworkLimits: string[] = [];

  if (project?.config?.["limits.instances"]) {
    instanceLimits.push(`Instances: ${project.config["limits.instances"]}`);
  }
  if (project?.config?.["limits.containers"]) {
    instanceLimits.push(`Containers: ${project.config["limits.containers"]}`);
  }
  if (project?.config?.["limits.virtual-machines"]) {
    instanceLimits.push(`VMs: ${project.config["limits.virtual-machines"]}`);
  }

  if (project?.config?.["limits.cpu"]) {
    computeLimits.push(`CPU: ${project.config["limits.cpu"]}`);
  }
  if (project?.config?.["limits.memory"]) {
    computeLimits.push(`Memory: ${project.config["limits.memory"]}`);
  }
  if (project?.config?.["limits.processes"]) {
    computeLimits.push(`Processes: ${project.config["limits.processes"]}`);
  }

  if (project?.config?.["limits.disk"]) {
    storageNetworkLimits.push(`Disk: ${project.config["limits.disk"]}`);
  }
  if (project?.config?.["limits.networks"]) {
    storageNetworkLimits.push(`Networks: ${project.config["limits.networks"]}`);
  }

  const rows: TooltipRow[] = [
    {
      title: "Project",
      value: project ? (
        <Link
          to={`/ui/project/${encodeURIComponent(projectName)}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ItemName item={project} />
        </Link>
      ) : (
        <Spinner />
      ),
      valueTitle: projectName,
    },
    {
      title: "Description",
      value: projectDescription,
      valueTitle: projectDescription,
    },
    {
      title: "Default root storage",
      value: defaultStoragePool ? (
        <ResourceLink
          type="pool"
          value={defaultStoragePool}
          to={`/ui/project/${encodeURIComponent(projectName)}/storage/pool/${encodeURIComponent(defaultStoragePool)}`}
        />
      ) : (
        "-"
      ),
      truncate: false,
    },
    {
      title: "Default instance network",
      value:
        defaultNetwork !== "none" ? (
          <ResourceLink
            type="network"
            value={defaultNetwork}
            to={`/ui/project/${encodeURIComponent(projectName)}/network/${encodeURIComponent(defaultNetwork)}`}
          />
        ) : (
          "-"
        ),
      truncate: false,
    },
  ];

  if (isAboveMedium) {
    rows.push(
      {
        title: "Isolation",
        value:
          isolatedFeatures.length > 0 ? (
            <List
              items={isolatedFeatures}
              middot
              className="u-no-margin truncated"
              title={isolatedFeatures.join(", ")}
            />
          ) : (
            "-"
          ),
        valueTitle:
          isolatedFeatures.length > 0 ? isolatedFeatures.join(", ") : "-",
      },
      {
        title: "Restrictions",
        value: isRestricted ? "Enabled" : "Disabled",
      },
      {
        title: "Instance limits",
        value:
          instanceLimits.length > 0 ? (
            <List
              items={instanceLimits}
              middot
              className="u-no-margin truncated"
              title={instanceLimits.join(", ")}
            />
          ) : (
            "-"
          ),
        valueTitle: instanceLimits.length > 0 ? instanceLimits.join(", ") : "-",
      },
    );
  }

  if (isAboveLarge) {
    rows.push(
      {
        title: "Compute limits",
        value:
          computeLimits.length > 0 ? (
            <List
              items={computeLimits}
              middot
              className="u-no-margin truncated"
              title={computeLimits.join(", ")}
            />
          ) : (
            "-"
          ),
        valueTitle: computeLimits.length > 0 ? computeLimits.join(", ") : "-",
      },
      {
        title: "Storage & Network",
        value:
          storageNetworkLimits.length > 0 ? (
            <List
              items={storageNetworkLimits}
              middot
              className="u-no-margin truncated"
              title={storageNetworkLimits.join(", ")}
            />
          ) : (
            "-"
          ),
        valueTitle:
          storageNetworkLimits.length > 0
            ? storageNetworkLimits.join(", ")
            : "-",
      },
    );
  }

  return (
    <RichTooltipTable rows={rows} className="project-rich-tooltip-table" />
  );
};

export default ProjectRichTooltip;
