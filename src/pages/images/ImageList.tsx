import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  Row,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import DeleteImageBtn from "./actions/DeleteImageBtn";
import Loader from "components/Loader";
import { useParams } from "react-router-dom";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import { localLxdToRemoteImage } from "util/images";
import ScrollableTable from "components/ScrollableTable";
import useSortTableData from "util/useSortTableData";
import SelectableMainTable from "components/SelectableMainTable";
import BulkDeleteImageBtn from "pages/images/actions/BulkDeleteImageBtn";
import SelectedTableNotification from "components/SelectedTableNotification";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useDocs } from "context/useDocs";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import CustomIsoBtn from "pages/storage/actions/CustomIsoBtn";
import DownloadImageBtn from "./actions/DownloadImageBtn";
import UploadImageBtn from "pages/images/actions/UploadImageBtn";
import { useImagesInProject } from "context/useImages";
import { useImageEntitlements } from "util/entitlements/images";

const ImageList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const { canDeleteImage } = useImageEntitlements();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: images = [], error, isLoading } = useImagesInProject(project);

  if (error) {
    notify.failure("Loading images failed", error);
  }

  useEffect(() => {
    const validNames = new Set(images?.map((image) => image.fingerprint));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [images]);

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Alias", sortKey: "alias", className: "aliases" },
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
      (item.properties?.description ?? "")
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      item.aliases
        .map((alias) => alias.name)
        .join(", ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const deletableImages = filteredImages
    .filter(canDeleteImage)
    .map((image) => image.fingerprint);

  const selectedImages = images.filter((image) =>
    selectedNames.includes(image.fingerprint),
  );

  const rows = filteredImages.map((image) => {
    const actions = (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            projectName={project}
            image={localLxdToRemoteImage(image)}
          />,
          <DownloadImageBtn key="download" image={image} project={project} />,
          <DeleteImageBtn key="delete" image={image} project={project} />,
        ]}
      />
    );

    const imageAlias = image.aliases.map((alias) => alias.name).join(", ");
    const description = image.properties?.description ?? image.fingerprint;

    return {
      key: image.fingerprint,
      name: image.fingerprint,
      columns: [
        {
          content: description,
          role: "rowheader",
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
        name: description.toLowerCase(),
        alias: imageAlias.toLowerCase(),
        architecture: image.architecture,
        public: image.public,
        type: image.type,
        size: +image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  return (
    <CustomLayout
      mainClassName="images-list"
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/image-handling/`}
                title="Learn more about images"
              >
                Images
              </HelpLink>
            </PageHeader.Title>
            {selectedNames.length === 0 && images.length > 0 && (
              <PageHeader.Search>
                <SearchBox
                  name="search-images"
                  className="search-box u-no-margin--bottom"
                  type="text"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="Search"
                  value={query}
                  aria-label="Search for images"
                />
              </PageHeader.Search>
            )}
            {selectedImages.length > 0 && (
              <BulkDeleteImageBtn
                images={selectedImages}
                project={project}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
              />
            )}
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <UploadImageBtn projectName={project} />
            <CustomIsoBtn project={project} />
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {images.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon name="image" className="empty-state-icon" />}
            title="No images found in this project"
          >
            <p>
              Images will appear here, when launching an instance from a remote.
            </p>
          </EmptyState>
        )}
        {images.length > 0 && (
          <ScrollableTable
            dependencies={[images]}
            tableId="image-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="image"
              className="u-no-margin--top"
              aria-label="Table pagination control"
              description={
                selectedNames.length > 0 && (
                  <SelectedTableNotification
                    totalCount={deletableImages.length ?? 0}
                    itemName="image"
                    parentName="project"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    filteredNames={deletableImages}
                  />
                )
              }
            >
              <SelectableMainTable
                id="image-table"
                headers={headers}
                sortable
                className="image-table"
                defaultSortKey="uploaded_at"
                emptyStateMsg="No images found matching this search"
                onUpdateSort={updateSort}
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                itemName="image"
                parentName="project"
                filteredNames={filteredImages.map((item) => item.fingerprint)}
                disabledNames={processingNames}
                rows={[]}
              />
            </TablePagination>
          </ScrollableTable>
        )}
      </Row>
    </CustomLayout>
  );
};

export default ImageList;
