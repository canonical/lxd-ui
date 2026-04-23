import type { FC } from "react";
import type { LxdImageRegistry } from "types/image";
import { List } from "@canonical/react-components";

interface Props {
  imageRegistry: LxdImageRegistry;
}

export const ImageRegistryProtocol: FC<Props> = ({ imageRegistry }) => {
  const isSimpleStreams = imageRegistry.protocol === "simplestreams";
  const url = imageRegistry.config?.url ?? "";
  const sourceProject = `Project: ${imageRegistry.config?.source_project ?? ""}`;
  const cluster = `Cluster: ${imageRegistry.config?.cluster ?? ""}`;
  const source = isSimpleStreams ? (
    url
  ) : (
    <List
      inline
      middot
      className="image-registry-protocol"
      items={[cluster, sourceProject]}
    />
  );

  return (
    <>
      {imageRegistry.protocol}
      {source && (
        <div
          className="u-text--muted u-truncate"
          title={isSimpleStreams ? url : `${cluster} - ${sourceProject}`}
        >
          {source}
        </div>
      )}
    </>
  );
};
