import { FC } from "react";
import ResourceLink from "./ResourceLink";
import { LxdUsedBy } from "util/usedBy";
import { ResourceIconType } from "./ResourceIcon";
import { useQuery } from "@tanstack/react-query";
import { fetchImageList } from "api/images";
import { queryKeys } from "util/queryKeys";

interface Props {
  item: LxdUsedBy;
  activeProject: string;
  type: ResourceIconType;
  to: string;
}

const UsedByItem: FC<Props> = ({ item, activeProject, type, to }) => {
  const { data: images = [] } = useQuery({
    queryKey: [queryKeys.images],
    queryFn: () => fetchImageList(activeProject),
    enabled: type === "image",
  });

  const image = images.find((image) => image.fingerprint === item.name);
  const label = image?.properties?.description || item.name;

  return (
    <div>
      {item.project !== activeProject && (
        <>
          <ResourceLink
            type="project"
            value={item.project}
            to={`/ui/project/${item.project}/instances`}
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
