import React, { FC } from "react";
import { EmptyState, Icon, List, MainTable } from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { loadIsoImages } from "context/loadIsoImages";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";

interface Props {
  project: string;
}

const IsoImageList: FC<Props> = ({ project }) => {
  const { data: isoImages = [], isLoading } = useQuery({
    queryKey: [queryKeys.isoImages],
    queryFn: () => loadIsoImages(project),
  });

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Storage pool", sortKey: "storagePool" },
    { content: "Used by", sortKey: "usedBy" },
    { content: "Upload date", sortKey: "uploadedAt" },
    { content: "Size", sortKey: "size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = isoImages.map((image) => {
    const actions = image.volume && (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            project={project}
            image={image}
          />,
          <DeleteStorageVolumeBtn
            key="delete"
            pool={image.pool ?? ""}
            volume={image.volume}
            project={project}
          />,
        ]}
      />
    );

    return {
      columns: [
        {
          content: image.aliases,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: image.pool,
          role: "cell",
          "aria-label": "Storage pool",
        },
        {
          content: image.volume?.used_by?.length ?? 0,
          role: "cell",
          "aria-label": "Used by",
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
          content: actions,
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
        usedBy: image.volume?.used_by?.length ?? 0,
      },
    };
  });

  return !isLoading && isoImages.length === 0 ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="mount" className="empty-state-icon" />}
      title="No custom ISO images found"
    >
      <p>
        Images will appear here, when uploading a custom ISO on instance launch.
      </p>
    </EmptyState>
  ) : (
    <>
      <MainTable
        headers={headers}
        rows={rows}
        paginate={30}
        responsive
        sortable
        className="u-table-layout--auto"
        emptyStateMsg={<Loader text="Loading images..." />}
      />
    </>
  );
};

export default IsoImageList;
