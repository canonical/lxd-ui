import { FC, useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  MainTable,
  Row,
  SearchBox,
  TablePagination,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import Loader from "components/Loader";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import UploadCustomIsoBtn from "pages/images/actions/UploadCustomIsoBtn";
import ScrollableTable from "components/ScrollableTable";
import { Link, useParams } from "react-router-dom";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import { useToastNotification } from "context/toastNotificationProvider";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import ResourceLabel from "components/ResourceLabel";
import { useLoadIsoVolumes } from "context/useVolumes";

const CustomIsoList: FC = () => {
  const docBaseLink = useDocs();
  const toastNotify = useToastNotification();
  const [query, setQuery] = useState<string>("");
  const { project } = useParams<{
    project: string;
  }>();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: images = [], isLoading } = useLoadIsoVolumes(project);

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
            projectName={project}
            image={image}
          />,
          <DeleteStorageVolumeBtn
            key="delete"
            volume={image.volume}
            project={project}
            onFinish={() =>
              toastNotify.success(
                <>
                  Custom iso{" "}
                  <ResourceLabel bold type="iso-volume" value={image.aliases} />{" "}
                  deleted.
                </>,
              )
            }
          />,
        ]}
      />
    );

    return {
      key: image.fingerprint,
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

  const hasImages = images.length !== 0;

  const content = !hasImages ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="iso" className="empty-state-icon" />}
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
      <UploadCustomIsoBtn
        className="empty-state-button"
        projectName={project}
      />
    </EmptyState>
  ) : (
    <div className="custom-iso-list">
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

  return (
    <CustomLayout
      contentClassName="detail-page"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/explanation/storage/`}
                title="Learn more about storage pools, volumes and buckets"
              >
                Custom ISOs
              </HelpLink>
            </PageHeader.Title>
            {hasImages && (
              <PageHeader.Search>
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
              </PageHeader.Search>
            )}
          </PageHeader.Left>
          {hasImages && (
            <PageHeader.BaseActions>
              <UploadCustomIsoBtn
                className="u-float-right u-no-margin--bottom"
                projectName={project}
              />
            </PageHeader.BaseActions>
          )}
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>{content}</Row>
    </CustomLayout>
  );
};

export default CustomIsoList;
