import React, { FC } from "react";
import { Button, MainTable } from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { loadIsoImages } from "context/loadIsoImages";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { useProject } from "context/project";
import { RemoteImage } from "types/image";
import { IsoImage } from "types/iso";

interface Props {
  primaryImage: IsoImage | null;
  onSelect: (image: RemoteImage, type: string | null) => void;
  onUpload: () => void;
  onCancel: () => void;
}

const CustomIsoSelector: FC<Props> = ({
  primaryImage,
  onSelect,
  onUpload,
  onCancel,
}) => {
  const { project } = useProject();
  const projectName = project?.name ?? "";

  const { data: images = [], isLoading } = useQuery({
    queryKey: [queryKeys.isoImages, project],
    queryFn: () => loadIsoImages(projectName),
  });

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Storage pool", sortKey: "storagePool" },
    { content: "Upload date", sortKey: "uploadedAt" },
    { content: "Size", sortKey: "size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = images.map((image) => {
    return {
      columns: [
        {
          content: (
            <div className="u-truncate iso-name" title={image.aliases}>
              {image.aliases}
            </div>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: image.pool,
          role: "cell",
          "aria-label": "Storage pool",
        },
        {
          content: isoTimeToString(new Date(image.created_at).toISOString()),
          role: "cell",
          "aria-label": "Uploaded at",
        },
        {
          content:
            image.volume?.config.size &&
            humanFileSize(+image.volume.config.size),
          role: "cell",
          "aria-label": "Size",
        },
        {
          content: (
            <Button
              appearance={
                primaryImage?.name === image.aliases &&
                primaryImage.pool === image.pool
                  ? "positive"
                  : ""
              }
              onClick={() => onSelect(image, "virtual-machine")}
              dense
            >
              Select
            </Button>
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right",
        },
      ],
      sortData: {
        name: image.aliases.toLowerCase(),
        storagePool: image.pool?.toLowerCase(),
        size: image.volume?.config.size,
        uploadedAt: image.created_at,
      },
    };
  });

  return (
    <>
      <div className="iso-table">
        <MainTable
          headers={headers}
          rows={rows}
          paginate={30}
          responsive
          sortable
          className="u-table-layout--auto"
          emptyStateMsg={
            isLoading ? (
              <Loader text="Loading images..." />
            ) : (
              "No custom ISOs found"
            )
          }
        />
      </div>
      <footer className="p-modal__footer">
        <Button className="u-no-margin--bottom" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          appearance={rows.length === 0 ? "positive" : ""}
          onClick={onUpload}
          type="button"
          className="iso-btn u-no-margin--bottom"
        >
          <span>Upload custom ISO</span>
        </Button>
      </footer>
    </>
  );
};

export default CustomIsoSelector;
