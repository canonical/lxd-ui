import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import { RichTooltipTable } from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { Link } from "react-router";
import { useImageRegistry } from "context/useImageRegistries";
import { isImageRegistryPublic } from "util/image-registries";
import ItemName from "components/ItemName";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  imageRegistryName: string;
  imageRegistryUrl: string;
}

const ImageRegistryRichTooltip: FC<Props> = ({
  imageRegistryName,
  imageRegistryUrl,
}) => {
  const { data: imageRegistry, isLoading: isLoading } =
    useImageRegistry(imageRegistryName);

  if (!imageRegistry && !isLoading) {
    return (
      <>
        Image registry{" "}
        <ResourceLabel type="image-registry" value={imageRegistryName} bold />{" "}
        not found
      </>
    );
  }

  const description = imageRegistry?.description;
  const protcol = imageRegistry?.protocol;
  const isPublic = imageRegistry && isImageRegistryPublic(imageRegistry);
  const cluster = imageRegistry?.config?.cluster;
  const sourceProject = imageRegistry?.config?.source_project;
  const url = imageRegistry?.config?.url;

  const rows: TooltipRow[] = [
    {
      title: "Image Registry",
      value: imageRegistry ? (
        <Link
          to={imageRegistryUrl}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ItemName item={{ name: imageRegistryName }} />
        </Link>
      ) : (
        <Spinner />
      ),
      valueTitle: imageRegistryName,
    },
    {
      title: "Description",
      value: description || "-",
      valueTitle: description,
    },
    {
      title: "Protocol",
      value: protcol || "-",
    },
    {
      title: "Public",
      value: isPublic ? "Yes" : "No",
    },
    { title: "Built-in", value: imageRegistry?.builtin ? "Yes" : "No" },
  ];

  if (imageRegistry && protcol === "simplestreams") {
    rows.push({
      title: "Server URL",
      value: url || "-",
      valueTitle: url,
    });
  }

  if (imageRegistry && protcol === "lxd") {
    rows.push({
      title: "Cluster",
      value: cluster ? (
        <Link to={`${ROOT_PATH}/ui/cluster/links`}>{cluster}</Link>
      ) : (
        "-"
      ),
      valueTitle: cluster,
    });

    rows.push({
      title: "Source Project",
      value: sourceProject || "-",
      valueTitle: sourceProject,
    });
  }

  return (
    <RichTooltipTable
      rows={rows}
      className="image-registry-rich-tooltip-table"
    />
  );
};

export default ImageRegistryRichTooltip;
