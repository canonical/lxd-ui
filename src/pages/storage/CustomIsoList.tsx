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
import { useQuery } from "@tanstack/react-query";
import { loadIsoVolumes } from "context/loadIsoVolumes";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import UploadCustomIsoBtn from "pages/images/actions/UploadCustomIsoBtn";
import ScrollableTable from "components/ScrollableTable";
import { usePagination } from "util/pagination";
import Pagination from "components/Pagination";
import { Link } from "react-router-dom";

interface Props {
  project: string;
}

const CustomIsoList: FC<Props> = ({ project }) => {
  const notify = useNotify();
  const [query, setQuery] = useState<string>("");

  const { data: images = [], isLoading } = useQuery({
    queryKey: [queryKeys.isoVolumes, project],
    queryFn: () => loadIsoVolumes(project),
  });

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Storage pool", sortKey: "storagePool", className: "pool" },
    { content: "Upload date", sortKey: "uploadedAt", className: "uploaded_at" },
    { content: "Size", sortKey: "size", className: "u-align--right size" },
    {
      content: "Used by",
      sortKey: "usedBy",
      className: "u-align--right used_by",
    },
    { "aria-label": "Actions", className: "actions" },
  ];

  const filteredImages = images.filter(
    (item) =>
      !query || item.aliases.toLowerCase().includes(query.toLowerCase()),
  );

  const rows = filteredImages.map((image) => {
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
            volume={image.volume}
            project={project}
            onFinish={() =>
              notify.success(`Custom iso ${image.aliases} deleted.`)
            }
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
          content: (
            <div className="u-truncate" title={image.pool}>
              <Link to={`/ui/project/${project}/storage/detail/${image.pool}`}>
                {image.pool}
              </Link>
            </div>
          ),
          role: "cell",
          "aria-label": "Storage pool",
          className: "pool",
        },
        {
          content: isoTimeToString(new Date(image.created_at).toISOString()),
          role: "cell",
          "aria-label": "Uploaded at",
          className: "uploaded_at",
        },
        {
          content:
            image.volume?.config.size &&
            humanFileSize(+image.volume.config.size),
          role: "cell",
          "aria-label": "Size",
          className: "u-align--right size",
        },
        {
          content: image.volume?.used_by?.length ?? 0,
          role: "cell",
          "aria-label": "Used by",
          className: "u-align--right used_by",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: image.aliases.toLowerCase(),
        storagePool: image.pool?.toLowerCase(),
        size: +(image.volume?.config.size ?? 0),
        uploadedAt: image.created_at,
        usedBy: image.volume?.used_by?.length ?? 0,
      },
    };
  });

  const pagination = usePagination(rows);

  if (isLoading) {
    return <Loader text="Loading custom ISOs..." />;
  }

  return images.length === 0 ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="mount" className="empty-state-icon" />}
      title="No custom ISOs found in this project"
    >
      <p>Custom ISOs will appear here</p>
      <p>
        <a
          href="https://documentation.ubuntu.com/lxd/en/latest/explanation/storage/"
          target="_blank"
          rel="noreferrer"
        >
          Learn more about storage
          <Icon className="external-link-icon" name="external-link" />
        </a>
      </p>
      <UploadCustomIsoBtn className="empty-state-button" />
    </EmptyState>
  ) : (
    <div className="custom-iso-list">
      <div className="upper-controls-bar">
        <div className="search-box-wrapper">
          <SearchBox
            name="search-snapshot"
            className="search-box margin-right"
            type="text"
            onChange={(value) => {
              setQuery(value);
            }}
            placeholder="Search for custom ISOs"
            value={query}
            aria-label="Search for custom ISOs"
          />
        </div>
        <UploadCustomIsoBtn />
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
        keyword="custom ISO"
      />
      <ScrollableTable dependencies={[images]}>
        <MainTable
          headers={headers}
          rows={pagination.pageData}
          sortable
          className="custom-iso-table"
          onUpdateSort={pagination.updateSort}
          emptyStateMsg="No custom ISOs found matching this search"
        />
      </ScrollableTable>
    </div>
  );
};

export default CustomIsoList;
