import type { FC } from "react";
import ResourceLink from "./ResourceLink";
import type { LxdUsedBy } from "util/usedBy";
import type { ResourceIconType } from "./ResourceIcon";
import { useLocalImagesInProject } from "context/useImages";
import { getVolumeDetailUrl } from "util/storageVolume";
import type { LxdStorageVolume } from "types/storage";
import { InstanceRichChipWithActions } from "pages/instances/InstanceRichChipWithActions";
import ProfileRichChip from "pages/profiles/ProfileRichChip";
import { ROOT_PATH } from "util/rootPath";
import ProjectRichChip from "pages/projects/ProjectRichChip";

interface Props {
  item: LxdUsedBy;
  activeProject: string;
  type: ResourceIconType;
  to: string;
  projectLinkDetailPage?: string;
}

const UsedByItem: FC<Props> = ({
  item,
  activeProject,
  type,
  to,
  projectLinkDetailPage = "instances",
}) => {
  const isImageQueryEnabled = type === "image";
  const { data: images = [] } = useLocalImagesInProject(
    item.project || activeProject,
    isImageQueryEnabled,
  );

  const image = images.find((image) => image.fingerprint === item.name);
  const label = image?.properties?.description || item.name;

  return (
    <div>
      {item.project !== activeProject && type !== "image-registry" && (
        <>
          <ProjectRichChip
            projectName={item.project}
            urlSuffix={`/${encodeURIComponent(projectLinkDetailPage)}`}
          />{" "}
          /{" "}
        </>
      )}
      {type === "snapshot" && item.instance && (
        <>
          <ResourceLink
            type="instance"
            value={item.instance}
            to={`${ROOT_PATH}/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.instance)}`}
          />{" "}
          /{" "}
        </>
      )}
      {type === "snapshot" && item.volume && (
        <>
          <ResourceLink
            type="volume"
            value={item.volume}
            to={getVolumeDetailUrl({
              name: item.volume,
              project: item.project,
              pool: item.pool,
              type: "custom",
              location: item.target ?? "",
            } as LxdStorageVolume)}
          />{" "}
          /{" "}
        </>
      )}
      {type === "instance" && (
        <InstanceRichChipWithActions
          instanceName={item.name}
          projectName={item.project}
        />
      )}
      {type === "profile" && (
        <ProfileRichChip profileName={item.name} projectName={item.project} />
      )}
      {type === "image-registry" && (
        <ResourceLink
          type={type}
          value={label}
          to={`${ROOT_PATH}/ui/image-registry/${encodeURIComponent(item.name)}`}
        />
      )}
      {type !== "instance" &&
        type !== "profile" &&
        type !== "image-registry" && (
          <ResourceLink type={type} value={label} to={to} />
        )}
    </div>
  );
};

export default UsedByItem;
