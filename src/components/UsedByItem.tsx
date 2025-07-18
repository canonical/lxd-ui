import type { FC } from "react";
import ResourceLink from "./ResourceLink";
import type { LxdUsedBy } from "util/usedBy";
import type { ResourceIconType } from "./ResourceIcon";
import { useImagesInProject } from "context/useImages";
import { linkForVolumeDetail } from "util/storageVolume";
import type { LxdStorageVolume } from "types/storage";

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
  const { data: images = [] } = useImagesInProject(
    activeProject,
    isImageQueryEnabled,
  );

  const image = images.find((image) => image.fingerprint === item.name);
  const label = image?.properties?.description || item.name;

  return (
    <div>
      {item.project !== activeProject && (
        <>
          <ResourceLink
            type="project"
            value={item.project}
            to={`/ui/project/${encodeURIComponent(item.project)}/${encodeURIComponent(projectLinkDetailPage)}`}
          />{" "}
          /{" "}
        </>
      )}
      {type === "snapshot" && item.instance && (
        <>
          <ResourceLink
            type="instance"
            value={item.instance}
            to={`/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.instance)}`}
          />{" "}
          /{" "}
        </>
      )}
      {type === "snapshot" && item.volume && (
        <>
          <ResourceLink
            type={"volume"}
            value={item.volume}
            to={linkForVolumeDetail({
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
      <ResourceLink type={type} value={label} to={to} />
    </div>
  );
};

export default UsedByItem;
