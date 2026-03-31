import type { LxdInstance } from "types/instance";
import { useLocalImagesInProject } from "context/useImages";
import ResourceLink from "components/ResourceLink";
import ResourceLabel from "components/ResourceLabel";
import { ROOT_PATH } from "util/rootPath";

export const getImageLink = (instance: LxdInstance) => {
  const { data: images = [] } = useLocalImagesInProject(instance.project);
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
