import React, { FC, useState } from "react";
import { MainTable, Row, Tooltip } from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "./util/helpers";
import { queryKeys } from "./util/queryKeys";
import { fetchImageList } from "./api/images";
import NotificationRow from "./components/NotificationRow";
import DeleteImageBtn from "./buttons/images/DeleteImageBtn";
import { Notification } from "./types/notification";
import { StringParam, useQueryParam } from "use-query-params";
import BaseLayout from "./components/BaseLayout";
import { panelQueryParams } from "./panels/queryparams";
import CreateInstanceBtn from "./buttons/instances/CreateInstanceBtn";
import { useQuery } from "@tanstack/react-query";

const ImageList: FC = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const setPanelQs = useQueryParam("panel", StringParam)[1];

  const { data: images = [], isError } = useQuery({
    queryKey: [queryKeys.images],
    queryFn: fetchImageList,
  });

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  if (isError) {
    setFailure("Could not load images");
  }

  const headers = [
    { content: "Alias" },
    { content: "Fingerprint", sortKey: "fingerprint" },
    { content: "Public", sortKey: "public", className: "u-align--center" },
    { content: "Description", sortKey: "description" },
    { content: "Arch", sortKey: "architecture", className: "u-align--center" },
    { content: "Type", sortKey: "type", className: "u-align--center" },
    { content: "Size", sortKey: "size", className: "u-align--center" },
    { content: "Upload date", sortKey: "uploaded_at" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = images.map((image) => {
    const actions = (
      <div>
        <Tooltip message="Create instance" position="left">
          <CreateInstanceBtn image={image} />
        </Tooltip>
        <Tooltip message="Delete image" position="left">
          <DeleteImageBtn image={image} onFailure={setFailure} />
        </Tooltip>
      </div>
    );

    return {
      columns: [
        {
          content: image.aliases.map((data) => data.name).join(", "),
          role: "rowheader",
          "aria-label": "Alias",
        },
        {
          content: image.fingerprint,
          role: "rowheader",
          "aria-label": "Fingerprint",
        },
        {
          content: image.public ? "yes" : "no",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Public",
        },
        {
          content: image.properties.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: image.architecture,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Architecture",
        },
        {
          content: image.type,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Type",
        },
        {
          content: humanFileSize(image.size),
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Size",
        },
        {
          content: isoTimeToString(image.uploaded_at),
          role: "rowheader",
          "aria-label": "Upload date",
        },
        {
          content: actions,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        fingerprint: image.fingerprint,
        public: image.public,
        description: image.properties.description.toLowerCase(),
        architecture: image.architecture,
        type: image.type,
        size: image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Images"
        controls={
          <button
            className="p-button--positive u-no-margin--bottom"
            onClick={() => setPanelQs(panelQueryParams.imageImport)}
          >
            Import image
          </button>
        }
      >
        <NotificationRow
          notification={notification}
          close={() => setNotification(null)}
        />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="p-table--images"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ImageList;
