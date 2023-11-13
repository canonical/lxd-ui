import React, { FC, useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  MainTable,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { queryKeys } from "util/queryKeys";
import { fetchImageList } from "api/images";
import DeleteImageBtn from "./actions/DeleteImageBtn";
import { useQuery } from "@tanstack/react-query";
import Loader from "components/Loader";
import { useParams } from "react-router-dom";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import { localLxdToRemoteImage } from "util/images";
import ScrollableTable from "components/ScrollableTable";
import { usePagination } from "util/pagination";
import Pagination from "components/Pagination";

const ImageList: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");

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
    { content: "Alias", sortKey: "alias" },
    {
      content: "Architecture",
      sortKey: "architecture",
      className: "architecture",
    },
    {
      content: "Public",
      sortKey: "public",
      className: "public",
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

  const filteredImages = images.filter(
    (item) =>
      !query ||
      item.properties.description.toLowerCase().includes(query.toLowerCase()) ||
      item.aliases
        .map((alias) => alias.name)
        .join(", ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const rows = filteredImages.map((image) => {
    const actions = (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            project={project}
            image={localLxdToRemoteImage(image)}
          />,
          <DeleteImageBtn key="delete" image={image} project={project} />,
        ]}
      />
    );

    const imageAlias = image.aliases.map((alias) => alias.name).join(", ");

    return {
      columns: [
        {
          content: image.properties.description,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: imageAlias,
          role: "cell",
          "aria-label": "Aliases",
          className: "aliases",
        },
        {
          content: image.architecture,
          role: "cell",
          "aria-label": "Architecture",
          className: "architecture",
        },
        {
          content: image.public ? "Yes" : "No",
          role: "cell",
          "aria-label": "Public",
          className: "public",
        },
        {
          content: image.type == "virtual-machine" ? "VM" : "Container",
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
          content: actions,
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: image.properties.description.toLowerCase(),
        alias: imageAlias.toLowerCase(),
        architecture: image.architecture,
        public: image.public,
        type: image.type,
        size: +image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  const pagination = usePagination(rows);

  if (isLoading) {
    return <Loader text="Loading images..." />;
  }

  return images.length === 0 ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="mount" className="empty-state-icon" />}
      title="No images found in this project"
    >
      <p>Images will appear here, when launching an instance from a remote.</p>
    </EmptyState>
  ) : (
    <div className="image-list">
      <div className="upper-controls-bar">
        <div className="search-box-wrapper">
          <SearchBox
            name="search-images"
            className="search-box margin-right"
            type="text"
            onChange={(value) => {
              setQuery(value);
            }}
            placeholder="Search for images"
            value={query}
            aria-label="Search for images"
          />
        </div>
      </div>
      <Pagination
        {...pagination}
        id="pagination"
        className="u-no-margin--top"
        totalCount={images.length}
        visibleCount={
          filteredImages.length === images.length
            ? pagination.pageData.length
            : filteredImages.length
        }
        keyword="image"
      />
      <ScrollableTable dependencies={[images]}>
        <MainTable
          headers={headers}
          rows={pagination.pageData}
          sortable
          className="image-table"
          emptyStateMsg="No images found matching this search"
          onUpdateSort={pagination.updateSort}
        />
      </ScrollableTable>
    </div>
  );
};

export default ImageList;
