import React, { FC, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable, SearchBox, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStorageVolumes } from "api/storage-pools";
import { isoTimeToString } from "util/helpers";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import ScrollableTable from "components/ScrollableTable";
import CreateVolumeBtn from "pages/storage/actions/CreateVolumeBtn";

const StorageVolumes: FC = () => {
  const notify = useNotify();
  const [query, setQuery] = useState("");
  const { name: pool, project } = useParams<{
    name: string;
    project: string;
  }>();

  if (!pool) {
    return <>Missing storage pool name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: volumes,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, pool, queryKeys.volumes, project],
    queryFn: () => fetchStorageVolumes(pool, project),
  });

  if (error) {
    notify.failure("Loading storage volumes failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage volumes..." />;
  }
  if (!volumes) {
    return <>Loading storage volumes failed</>;
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Content type", sortKey: "contentType" },
    { content: "Type", sortKey: "type" },
    { content: "Created at", sortKey: "createdAt" },
    { content: "Location", sortKey: "location" },
    { content: "Used by", className: "used_by" },
    {
      content: "",
      className: "actions",
      "aria-label": "Actions",
    },
  ];

  const filteredVolumes = volumes.filter((volume) => {
    return volume.name.toLowerCase().includes(query.toLowerCase());
  });

  const rows = filteredVolumes.map((volume) => {
    return {
      columns: [
        {
          // If the volume name contains a slash, it's a snapshot, and we don't want to link to it
          content: volume.name.includes("/") ? (
            volume.name
          ) : (
            <div className="u-truncate" title={volume.name}>
              <Link
                to={`/ui/project/${project}/storage/detail/${pool}/${volume.type}/${volume.name}`}
              >
                {volume.name}
              </Link>
            </div>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: volume.content_type,
          role: "cell",
          "aria-label": "Content type",
        },
        {
          content: volume.name.includes("/")
            ? volume.type + " (snapshot)"
            : volume.type,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: isoTimeToString(volume.created_at),
          role: "cell",
          "aria-label": "Created at",
        },
        {
          content: volume.location,
          role: "cell",
          "aria-label": "Location",
        },
        {
          className: "used_by",
          content: volume.used_by?.length ?? 0,
          role: "cell",
          "aria-label": "Used by",
        },
        {
          className: "actions",
          content: (
            <>
              <DeleteStorageVolumeBtn
                pool={pool}
                volume={volume}
                project={project}
                onFinish={() => {
                  notify.success(`Storage volume ${volume.name} deleted.`);
                }}
              />
            </>
          ),
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: volume.name,
        contentType: volume.content_type,
        type: volume.type,
        createdAt: volume.created_at,
        location: volume.location,
      },
    };
  });

  return (
    <div className="storage-volumes">
      <div className="upper-controls-bar">
        <div className="search-box-wrapper">
          <SearchBox
            name="search-volumes"
            className="search-box margin-right"
            type="text"
            onChange={(value) => {
              setQuery(value);
            }}
            placeholder="Search for volumes"
            value={query}
            aria-label="Search for volumes"
          />
        </div>
        <div className="u-align--right">
          <CreateVolumeBtn project={project} pool={pool} />
        </div>
      </div>
      <ScrollableTable dependencies={[notify.notification]}>
        <MainTable
          headers={headers}
          rows={rows}
          sortable
          className="storage-volume-table"
        />
      </ScrollableTable>
    </div>
  );
};

export default StorageVolumes;
