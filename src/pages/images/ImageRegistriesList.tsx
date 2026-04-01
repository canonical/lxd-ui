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
import { useSearchParams } from "react-router-dom";
import type { LxdImageRegistryProtocol } from "types/image";
import { isRegistryPublic } from "util/image-registries";
import { CreateImageRegistryButton } from "./actions/CreateImageRegistryButton";

const ImageRegistriesList: FC = () => {
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const { data: imageRegistries = [], error, isLoading } = useImageRegistries();

  if (error) {
    notify.failure("Loading image registries failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    {
      content: "Protocol",
      sortKey: "protocol",
    },
    {
      content: "Built-in",
      sortKey: "builtin",
    },
    {
      content: "Public",
      sortKey: "public",
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

  const filteredImageRegistries = imageRegistries.filter(
    (item) =>
      (!filters.queries.length ||
        filters.queries.some(
          (query) =>
            (item?.description ?? "").toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query),
        )) &&
      (!filters.protocol.length || filters.protocol.includes(item.protocol)) &&
      (!filters.builtin.length || filters.builtin.includes(item.builtin)) &&
      (!filters.public.length ||
        filters.public.includes(isRegistryPublic(item))),
  );

  const rows = filteredImageRegistries.map((registry) => {
    return {
      key: registry.name,
      name: registry.name,
      columns: [
        {
          content: registry.name,
          role: "rowheader",
          "aria-label": "Name",
          title: `Image registry ${registry.name}`,
        },
        {
          content: (
            <div className="u-truncate" title={registry.description}>
              {registry.description}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: registry.protocol,
          role: "cell",
          "aria-label": "Protocol",
        },
        {
          content: registry.builtin ? "Yes" : "No",
          role: "cell",
          "aria-label": "Built-in",
        },
        {
          content: isRegistryPublic(registry) ? "Yes" : "No",
          role: "cell",
          "aria-label": "Public",
        },
      ],
      sortData: {
        name: registry.name.toLowerCase(),
        description: registry.description.toLowerCase(),
        protocol: registry.protocol.toLowerCase(),
        builtin: registry.builtin,
        public: isRegistryPublic(registry),
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
        <NotificationRow />
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
    </>
  );
};

export default ImageRegistriesList;
