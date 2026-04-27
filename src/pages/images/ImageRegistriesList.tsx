import { type FC } from "react";
import {
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  CustomLayout,
  Spinner,
  MainTable,
} from "@canonical/react-components";
import useSortTableData from "util/useSortTableData";
import { useImageRegistries } from "context/useImageRegistries";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import ImageRegistriesSearchFilter, {
  type ImageRegistryFilter,
} from "./ImageRegistriesSearchFilter";
import { Link, useSearchParams } from "react-router-dom";
import type { LxdImageRegistryProtocol } from "types/image";
import { isImageRegistryPublic } from "util/imageRegistries";
import { CreateImageRegistryButton } from "./actions/CreateImageRegistryButton";
import { ROOT_PATH } from "util/rootPath";
import usePanelParams, { panels } from "util/usePanelParams";
import { CreateImageRegistryPanel } from "./panels/CreateImageRegistryPanel";
import { ImageRegistryProtocol } from "./ImageRegistryProtocol";

const ImageRegistriesList: FC = () => {
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const panelParams = usePanelParams();

  const { data: imageRegistries = [], error, isLoading } = useImageRegistries();

  if (error) {
    notify.failure("Loading image registries failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name", className: "name", title: "Name" },
    {
      content: "Description",
      sortKey: "description",
      className: "description",
      title: "Description",
    },
    {
      content: "Protocol",
      sortKey: "protocol",
      className: "protocol",
      title: "Protocol",
    },
    {
      content: "Built-in",
      sortKey: "builtin",
      className: "built-in",
      title: "Built-in",
    },
    {
      content: "Public",
      sortKey: "public",
      className: "public",
      title: "Public",
    },
  ];

  const filters: ImageRegistryFilter = {
    queries: searchParams.getAll("query").map((value) => value.toLowerCase()),
    protocol: searchParams.getAll("protocol") as LxdImageRegistryProtocol[],
    builtin: searchParams
      .getAll("builtin")
      .map((value) => value.toLowerCase() === "yes"),
    public: searchParams
      .getAll("public")
      .map((value) => value.toLowerCase() === "yes"),
  };

  const filteredImageRegistries = imageRegistries.filter((item) => {
    const description = item.description ?? "";
    const sourceProject = item.config?.source_project ?? "";
    const cluster = item.config?.cluster ?? "";
    const url = item?.config?.url ?? "";

    return (
      (!filters.queries.length ||
        filters.queries.some(
          (query) =>
            description.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            sourceProject.includes(query) ||
            cluster.includes(query) ||
            url.includes(query),
        )) &&
      (!filters.protocol.length || filters.protocol.includes(item.protocol)) &&
      (!filters.builtin.length || filters.builtin.includes(item.builtin)) &&
      (!filters.public.length ||
        filters.public.includes(isImageRegistryPublic(item)))
    );
  });

  const rows = filteredImageRegistries.map((registry) => {
    const isPublicRegistry = isImageRegistryPublic(registry);
    const isSimpleStreams = registry.protocol === "simplestreams";
    const url = registry.config?.url ?? "";
    const sourceProject = registry.config?.source_project ?? "";
    const cluster = registry.config?.cluster ?? "";

    return {
      key: registry.name,
      name: registry.name,
      columns: [
        {
          content: (
            <Link
              to={`${ROOT_PATH}/ui/image-registry/${encodeURIComponent(registry.name)}`}
              className="u-truncate"
            >
              {registry.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
          title: `Image registry ${registry.name}`,
          className: "name",
        },
        {
          content: (
            <div className="u-truncate" title={registry.description}>
              {registry.description}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
          className: "description",
        },
        {
          content: <ImageRegistryProtocol imageRegistry={registry} />,
          role: "cell",
          "aria-label": "Protocol",
          className: "protocol",
        },
        {
          content: registry.builtin ? "Yes" : "No",
          role: "cell",
          "aria-label": "Built-in",
          className: "built-in",
        },
        {
          content: isPublicRegistry ? "Yes" : "No",
          role: "cell",
          "aria-label": "Public",
          className: "public",
        },
      ],
      sortData: {
        name: registry.name.toLowerCase(),
        description: registry.description.toLowerCase(),
        protocol: registry.protocol.toLowerCase(),
        builtin: registry.builtin,
        public: isPublicRegistry,
        source: isSimpleStreams
          ? url.toLowerCase()
          : `${cluster}/${sourceProject}`.toLowerCase(),
      },
    };
  });
  const { rows: sortedRows, updateSort } = useSortTableData({ rows });
  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    // This is needed because TablePagination does not support the plural form of registry
    if (rows.length === 0) {
      return "Showing 0 image registries";
    }
    const defaultPaginationDescription =
      rows.length > 1
        ? `Showing all ${rows.length} image registries`
        : `Showing 1 out of 1 image registry`;

    return defaultPaginationDescription;
  };

  return (
    <>
      <CustomLayout
        contentClassName="u-no-padding--bottom"
        mainClassName="image-registry-list"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/image-handling/"
                  title="Learn more about image registries"
                >
                  Image registries
                </HelpLink>
              </PageHeader.Title>
              {imageRegistries.length > 0 && (
                <PageHeader.Search>
                  <ImageRegistriesSearchFilter />
                </PageHeader.Search>
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <CreateImageRegistryButton />
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row>
          <ScrollableTable
            dependencies={[imageRegistries]}
            tableId="image-registries-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              className="u-no-margin--top"
              itemName="registry"
              aria-label="Table pagination control"
              description={getTablePaginationDescription()}
            >
              <MainTable
                id="image-registries-table"
                className="image-registry-table"
                defaultSort="Name"
                headers={headers}
                rows={rows}
                sortable
                emptyStateMsg="No matching image registries found."
                onUpdateSort={updateSort}
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </CustomLayout>

      {panelParams.panel === panels.createImageRegistry && (
        <CreateImageRegistryPanel />
      )}
    </>
  );
};

export default ImageRegistriesList;
