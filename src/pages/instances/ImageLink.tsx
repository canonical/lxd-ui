import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useImagesInProject } from "context/useImages";
import ResourceLink from "components/ResourceLink";
import ResourceLabel from "components/ResourceLabel";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  instance: LxdInstance;
}
export const ImageLink: FC<Props> = ({ instance }) => {
  const { data: images = [] } = useImagesInProject(instance.project);
  const imageDescription = instance.config["image.description"];
  const imageFound = images?.some(
    (image) => image.properties?.description === imageDescription,
  );

  if (!imageDescription) {
    return "-";
  }

  if (!imageFound) {
    return <ResourceLabel type="image" value={imageDescription} />;
  }

  return (
    <ResourceLink
      type="image"
      value={imageDescription}
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/images`}
    />
  );
};
