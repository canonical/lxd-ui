import type { FC } from "react";
import ResourceLink from "./ResourceLink";
import type { LxdUsedBy } from "util/usedBy";
import type { ResourceIconType } from "./ResourceIcon";
import { useImagesInProject } from "context/useImages";

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
            to={`/ui/project/${item.project}/${projectLinkDetailPage}`}
          />{" "}
          /{" "}
        </>
      )}
      {type === "snapshot" && item.instance && (
        <>
          <ResourceLink
            type="instance"
            value={item.instance}
            to={`/ui/project/${item.project}/instance/${item.instance}`}
          />{" "}
          /{" "}
        </>
      )}
      {type === "snapshot" && item.volume && (
        <>
          <ResourceLink
            type={"volume"}
            value={item.volume}
            to={`/ui/project/${item.project}/storage/pool/${item.pool}/volumes/custom/${item.volume}`}
          />{" "}
          /{" "}
        </>
      )}
      <ResourceLink type={type} value={label} to={to} />
    </div>
  );
};

export default UsedByItem;
