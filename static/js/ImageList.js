import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainTable, Tooltip } from "@canonical/react-components";
import { isoTimeToString } from "./helpers";
import { deleteImage, fetchImageList } from "./api/images";

function ImageList() {
  const [images, setImages] = useState([]);

  const loadImages = () => fetchImageList().then(setImages);
  useEffect(loadImages, []);

  const headers = [
    { content: "Alias" },
    { content: "Fingerprint", sortKey: "fingerprint" },
    { content: "Public", sortKey: "public" },
    { content: "Description", sortKey: "description" },
    { content: "Arch", sortKey: "architecture" },
    { content: "Type", sortKey: "type" },
    { content: "Size", sortKey: "size" },
    { content: "Upload date", sortKey: "uploaded_at" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = images.map((image) => {
    const actions = (
      <div>
        <Tooltip message="Delete Image" position="left">
          <button
            onClick={() => deleteImage(image).then(loadImages)}
            className="is-dense"
          >
            <i className="p-icon--delete">Delete</i>
          </button>
        </Tooltip>
      </div>
    );

    return {
      columns: [
        {
          content: image.aliases.join(", "),
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
          "aria-label": "Architecture",
        },
        {
          content: image.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: image.size,
          role: "rowheader",
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
      <div className="p-panel__header">
        <h4 className="p-panel__title">Images</h4>
        <div className="p-panel__controls">
          <Link
            className="p-button--positive u-no-margin--bottom"
            to="/images/add"
          >
            Add image
          </Link>
        </div>
      </div>
      <div className="p-panel__content">
        <MainTable
          headers={headers}
          rows={rows}
          paginate={30}
          responsive
          sortable
          className="p-table--images"
        />
      </div>
    </>
  );
}

export default ImageList;
