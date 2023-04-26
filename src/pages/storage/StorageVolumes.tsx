import React, { FC } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Col, MainTable, Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStorageVolumes } from "api/storage-pools";
import { isoTimeToString } from "util/helpers";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";

const StorageVolumes: FC = () => {
  const notify = useNotify();
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
    { content: "Name" },
    { content: "Content type" },
    { content: "Type" },
    { content: "Created at" },
    { content: "Description" },
    { content: "Location" },
    { content: "Config" },
    { content: "Used by" },
    {
      content: "",
      "aria-label": "Actions",
    },
  ];

  const rows = volumes.map((volume) => {
    return {
      columns: [
        {
          content: volume.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: volume.content_type,
          role: "rowheader",
          "aria-label": "Content type",
        },
        {
          content: volume.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: isoTimeToString(volume.created_at),
          role: "rowheader",
          "aria-label": "Created at",
        },
        {
          content: volume.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: volume.location,
          role: "rowheader",
          "aria-label": "Location",
        },
        {
          content: Object.entries(volume.config).map(([key, val]) => (
            <div key={key}>
              {key}: {val}
            </div>
          )),
          role: "rowheader",
          "aria-label": "Config",
        },
        {
          content: volume.used_by?.map((entry) => (
            <div key={entry}>{entry}</div>
          )),
          role: "rowheader",
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
          role: "rowheader",
          "aria-label": "Actions",
        },
      ],
    };
  });

  return (
    <BaseLayout title={`Storage Volumes in pool ${pool}`}>
      <NotificationRow />
      <Row>
        <Col size={12}>
          <MainTable headers={headers} rows={rows} />
        </Col>
      </Row>
    </BaseLayout>
  );
};

export default StorageVolumes;
