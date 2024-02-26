import { FC } from "react";
import { Button, MainTable } from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { loadIsoVolumes } from "context/loadIsoVolumes";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { useProject } from "context/project";
import { LxdImageType, RemoteImage } from "types/image";
import { IsoImage } from "types/iso";

interface Props {
  primaryImage: IsoImage | null;
  onSelect: (image: RemoteImage, type: LxdImageType | null) => void;
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
    queryKey: [queryKeys.isoVolumes, project],
    queryFn: () => loadIsoVolumes(projectName),
  });

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Storage pool", sortKey: "storagePool" },
    { content: "Upload date", sortKey: "uploadedAt" },
    { content: "Size", sortKey: "size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = images.map((image) => {
    const selectIso = () => onSelect(image, "virtual-machine");

    return {
      className: "u-row",
      columns: [
        {
          content: (
            <div className="u-truncate iso-name" title={image.aliases}>
              {image.aliases}
            </div>
          ),
          role: "cell",
          "aria-label": "Name",
          onClick: selectIso,
        },
        {
          content: image.pool,
          role: "cell",
          "aria-label": "Storage pool",
          onClick: selectIso,
        },
        {
          content: isoTimeToString(new Date(image.created_at).toISOString()),
          role: "cell",
          "aria-label": "Uploaded at",
          onClick: selectIso,
        },
        {
          content:
            image.volume?.config.size &&
            humanFileSize(+image.volume.config.size),
          role: "cell",
          "aria-label": "Size",
          onClick: selectIso,
        },
        {
          content: (
            <Button
              appearance={
                primaryImage?.name === image.aliases &&
                primaryImage?.pool === image.pool
                  ? "positive"
                  : ""
              }
              onClick={selectIso}
              dense
            >
              Select
            </Button>
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right",
          onClick: selectIso,
        },
      ],
      sortData: {
        name: image.aliases.toLowerCase(),
        storagePool: image.pool?.toLowerCase(),
        size: +(image.volume?.config.size ?? 0),
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
          sortable
          className="table-iso-select u-table-layout--auto"
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
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          onClick={onCancel}
        >
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
