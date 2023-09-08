import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable, SearchBox, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStorageVolumes } from "api/storage-pools";
import { isoTimeToString } from "util/helpers";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import ScrollableTable from "components/ScrollableTable";

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
    queryKey: [queryKeys.storage, pool, queryKeys.volumes],
    queryFn: () => fetchStorageVolumes(pool),
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
    { content: "Config" },
    { content: "Used by" },
    {
      content: "",
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
          content: volume.name,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: volume.content_type,
          role: "cell",
          "aria-label": "Content type",
        },
        {
          content: volume.type,
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
          content: Object.entries(volume.config).map(([key, val]) => (
            <div key={key}>
              {key}: {val}
            </div>
          )),
          role: "cell",
          "aria-label": "Config",
        },
        {
          content: volume.used_by?.length ?? 0,
          role: "cell",
          "aria-label": "Used by",
        },
        {
          content: (
            <>
              <DeleteStorageVolumeBtn
                pool={pool}
                volume={volume}
                project={project}
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
    <>
      <SearchBox
        name="search-volumes"
        className="search-volumes margin-right"
        type="text"
        onChange={(value) => {
          setQuery(value);
        }}
        placeholder="Search for volumes"
        value={query}
        aria-label="Search for volumes"
      />
      <ScrollableTable dependencies={[notify.notification]}>
        <MainTable headers={headers} rows={rows} sortable />
      </ScrollableTable>
    </>
  );
};

export default StorageVolumes;
