import { FC, useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  MainTable,
  SearchBox,
  TablePagination,
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
import { Link } from "react-router-dom";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  project: string;
}

const CustomIsoList: FC<Props> = ({ project }) => {
  const docBaseLink = useDocs();
  const toastNotify = useToastNotification();
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
              toastNotify.success(`Custom iso ${image.aliases} deleted.`)
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
              <Link to={`/ui/project/${project}/storage/pool/${image.pool}`}>
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

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

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
          href={`${docBaseLink}/explanation/storage/`}
          target="_blank"
          rel="noopener noreferrer"
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
      <ScrollableTable
        dependencies={[images]}
        tableId="custom-iso-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="custom ISO"
          className="u-no-margin--top"
          aria-label="Table pagination control"
        >
          <MainTable
            id="custom-iso-table"
            headers={headers}
            sortable
            className="custom-iso-table"
            onUpdateSort={updateSort}
            emptyStateMsg="No custom ISOs found matching this search"
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  );
};

export default CustomIsoList;
