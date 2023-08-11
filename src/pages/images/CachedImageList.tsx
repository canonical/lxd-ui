import React, { FC } from "react";
import {
  EmptyState,
  Icon,
  List,
  MainTable,
  useNotify,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { queryKeys } from "util/queryKeys";
import { fetchImageList } from "api/images";
import DeleteCachedImageBtn from "./actions/DeleteCachedImageBtn";
import { useQuery } from "@tanstack/react-query";
import Loader from "components/Loader";
import { useParams } from "react-router-dom";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import { cachedLxdToRemoteImage } from "util/images";

const ImageList: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: images = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.images, project],
    queryFn: () => fetchImageList(project),
  });

  if (error) {
    notify.failure("Loading images failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Architecture", sortKey: "architecture" },
    { content: "Type", sortKey: "type" },
    { content: "Upload date", sortKey: "uploaded_at" },
    { content: "Size", sortKey: "size" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = images.map((image) => {
    const actions = (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            project={project}
            image={cachedLxdToRemoteImage(image)}
          />,
          <DeleteCachedImageBtn key="delete" image={image} project={project} />,
        ]}
      />
    );

    return {
      columns: [
        {
          content: image.properties.description,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: image.architecture,
          role: "cell",
          "aria-label": "Architecture",
        },
        {
          content: image.type,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: isoTimeToString(image.uploaded_at),
          role: "cell",
          "aria-label": "Upload date",
        },
        {
          content: humanFileSize(image.size),
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
        name: image.properties.description.toLowerCase(),
        architecture: image.architecture,
        type: image.type,
        size: image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  return !isLoading && images.length === 0 ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="mount" className="empty-state-icon" />}
      title="No cached images found in this project"
    >
      <p>Images will appear here, when launching an instance from a remote.</p>
    </EmptyState>
  ) : (
    <MainTable
      headers={headers}
      rows={rows}
      paginate={30}
      responsive
      sortable
      className="u-table-layout--auto"
      emptyStateMsg={<Loader text="Loading images..." />}
    />
  );
};

export default ImageList;
