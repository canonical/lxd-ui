import type { FC } from "react";
import { ContextualMenu, Spinner } from "@canonical/react-components";
import UsedByItem from "components/UsedByItem";
import ResourceLink from "components/ResourceLink";
import { useLoadVolumes } from "context/useVolumes";
import { useProjectsProfiles } from "context/useProfiles";
import type { LxdDiskDevice } from "types/device";
import { getLinkTarget, type LxdUsedBy } from "util/usedBy";
import {
  getDeviceVolumes,
  getVolumeInstances,
  getVolumeProfiles,
} from "util/volumeUsage";

const MAX_LINES = 2;

export const UNKNOWN_USED_BY = <span className="u-text--muted">Unknown</span>;

interface Props {
  device: LxdDiskDevice;
  project: string;
  location?: string;
  instanceName?: string;
}

const DeviceUsedBy: FC<Props> = ({
  device,
  project,
  location,
  instanceName,
}) => {
  const {
    data: volumes = [],
    isLoading: isVolumesLoading,
    error: volumesError,
  } = useLoadVolumes(project);
  const deviceVolumes = getDeviceVolumes(device, volumes, location);
  const usedByProfiles = getVolumeProfiles(deviceVolumes);
  const profileProjects = [
    ...new Set(usedByProfiles.map((profile) => profile.project)),
  ];
  const profileQueries = useProjectsProfiles(profileProjects);

  if (isVolumesLoading || profileQueries.some((query) => query.isLoading)) {
    return <Spinner />;
  }

  if (
    volumesError ||
    profileQueries.some((query) => query.error) ||
    deviceVolumes.length === 0
  ) {
    return UNKNOWN_USED_BY;
  }

  const profiles = profileQueries.flatMap((query, index) =>
    (query.data ?? []).filter((profile) =>
      usedByProfiles.some(
        (item) =>
          item.name === profile.name && item.project === profileProjects[index],
      ),
    ),
  );
  const sortedInstances = getVolumeInstances(deviceVolumes, profiles);
  const current = sortedInstances.find(
    (instance) =>
      instance.name === instanceName && instance.project === project,
  );
  const instances = current
    ? [current, ...sortedInstances.filter((instance) => instance !== current)]
    : sortedInstances;

  if (instances.length === 0) {
    return "-";
  }

  const renderInstance = (instance: LxdUsedBy) => (
    <UsedByItem
      key={`${instance.project}/${instance.name}`}
      item={instance}
      activeProject={project}
      type="instance"
      to={getLinkTarget(instance, "instance")}
    />
  );

  if (instances.length <= MAX_LINES) {
    return <>{instances.map(renderInstance)}</>;
  }

  const [first, ...others] = instances;

  return (
    <>
      {renderInstance(first)}
      <ContextualMenu
        toggleLabel={`+${others.length}`}
        toggleAppearance="base"
        toggleClassName="u-no-margin--bottom u-no-padding--left u-text--muted"
        toggleProps={{
          dense: true,
          small: true,
          "aria-label": `Show ${others.length} more instances`,
        }}
        position="left"
      >
        <div className="p-contextual-menu__group">
          {others.map((instance) => (
            <div
              key={`${instance.project}/${instance.name}`}
              className="p-contextual-menu__link"
            >
              {instance.project !== project && `${instance.project} / `}
              <ResourceLink
                type="instance"
                value={instance.name}
                to={getLinkTarget(instance, "instance")}
              />
            </div>
          ))}
        </div>
      </ContextualMenu>
    </>
  );
};

export default DeviceUsedBy;
