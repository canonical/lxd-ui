import type { FC } from "react";
import {
  ScrollableTable,
  TablePagination,
  MainTable,
} from "@canonical/react-components";
import ExpandableList from "components/ExpandableList";
import { useCurrentProject } from "context/useCurrentProject";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import type { LxdImage } from "types/image";
import { getArchitectureDisplayName } from "util/architectures";
import { humanFileSize, isoTimeToString } from "util/helpers";
import {
  getImageAlias,
  getImageName,
  getImageTypeDisplayName,
  localLxdToRemoteImage,
} from "util/images";
import useSortTableData from "util/useSortTableData";

interface Props {
  images: LxdImage[];
  imageRegistryName: string;
  supportedArchitectures?: string[];
}

const ImageTable: FC<Props> = ({
  images,
  supportedArchitectures = [],
  imageRegistryName,
}) => {
  const { projectName, project } = useCurrentProject();

  const isImageRegistryAllowed = (): boolean => {
    if (project?.config.restricted !== "true") {
      return true;
    }

    const allowedRegistries =
      project?.config["restricted.registries"]?.split(",") ?? [];
    return allowedRegistries.includes(imageRegistryName);
  };

  const getDisabledReason = (image: LxdImage): string | undefined => {
    if (!supportedArchitectures.includes(image.architecture)) {
      return "Image is incompatible with your hardware architecture";
    }
    if (!isImageRegistryAllowed()) {
      return "Images from this registry are not allowed in this project";
    }
    return undefined;
  };

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Alias", sortKey: "alias", className: "aliases" },
    {
      content: "Architecture",
      sortKey: "architecture",
      className: "architecture",
    },
    { content: "Type", sortKey: "type", className: "type" },
    {
      content: "Upload date",
      sortKey: "uploaded_at",
      className: "uploaded_at",
    },
    { content: "Size", sortKey: "size", className: "u-align--right size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = images.map((image) => {
    const imageAlias = getImageAlias(image);
    const imageName = getImageName(image);

    const aliasItems =
      image.aliases && Array.isArray(image.aliases)
        ? image.aliases
            .filter((alias) => alias && alias.name)
            .map((alias) => (
              <div key={alias.name} className="u-truncate" title={alias.name}>
                {alias.name}
              </div>
            ))
        : [];

    return {
      key: image.fingerprint,
      name: image.fingerprint,
      columns: [
        {
          content: imageName,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content:
            aliasItems.length > 0 ? (
              <ExpandableList items={aliasItems} displayCount={2} />
            ) : null,
          role: "cell",
          "aria-label": "Aliases",
          className: "aliases",
        },
        {
          content: getArchitectureDisplayName(image.architecture),
          role: "cell",
          "aria-label": "Architecture",
          className: "architecture",
        },
        {
          content: getImageTypeDisplayName(image),
          role: "cell",
          "aria-label": "Type",
          className: "type",
        },
        {
          content: isoTimeToString(image.uploaded_at),
          role: "cell",
          "aria-label": "Upload date",
          className: "uploaded_at",
        },
        {
          content: humanFileSize(image.size),
          role: "cell",
          "aria-label": "Size",
          className: "u-align--right size",
        },
        {
          content: (
            <CreateInstanceFromImageBtn
              key="launch"
              projectName={projectName}
              image={localLxdToRemoteImage(image)}
              disabledReason={getDisabledReason(image)}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: imageName.toLowerCase(),
        alias: imageAlias?.toLowerCase(),
        architecture: image.architecture,
        cached: image.cached,
        type: image.type,
        size: +image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (images.length === 0) {
    return "No images found";
  }

  return (
    <ScrollableTable
      dependencies={[images]}
      tableId="image-table"
      belowIds={["status-bar"]}
    >
      <TablePagination
        data={sortedRows}
        id="pagination"
        itemName="image"
        className="u-no-margin--top"
        aria-label="Table pagination control"
      >
        <MainTable
          id="image-table"
          headers={headers}
          sortable
          className="image-registry-image-table"
          emptyStateMsg="No images found"
          onUpdateSort={updateSort}
          rows={sortedRows}
        />
      </TablePagination>
    </ScrollableTable>
  );
};

export default ImageTable;
