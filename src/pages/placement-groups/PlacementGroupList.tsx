import type { FC } from "react";
import {
  Button,
  Col,
  CustomLayout,
  EmptyState,
  Icon,
  List,
  MainTable,
  Row,
  ScrollableTable,
  Spinner,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import { usePlacementGroups } from "context/usePlacementGroups";
import usePanelParams, { panels } from "util/usePanelParams";
import CreatePlacementGroupPanel from "pages/placement-groups/panels/CreatePlacementGroupPanel";
import EditPlacementGroupPanel from "pages/placement-groups/panels/EditPlacementGroupPanel";
import DeletePlacementGroupBtn from "pages/placement-groups/actions/DeletePlacementGroupBtn";
import CreatePlacementGroupBtn from "pages/placement-groups/actions/CreatePlacementGroupBtn";
import DocLink from "components/DocLink";

const PlacementGroupList: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>Missing project</>;
  }

  const {
    data: placementGroups = [],
    error,
    isLoading,
  } = usePlacementGroups(projectName);

  if (error) {
    notify.failure("Loading placement groups failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Policy", sortKey: "policy" },
    { content: "Rigor", sortKey: "rigor" },
    { content: "Used by", sortKey: "usedBy" },
    {
      "aria-label": "Actions",
    },
  ];

  const rows = placementGroups.map((placementGroup) => {
    return {
      key: placementGroup.name,
      columns: [
        {
          content: placementGroup.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: (
            <div
              className="table-description"
              title={`Description ${placementGroup.description}`}
            >
              {placementGroup.description}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: placementGroup.config.policy,
          role: "cell",
          "aria-label": "Policy",
        },
        {
          content: placementGroup.config.rigor,
          role: "cell",
          "aria-label": "Rigor",
        },
        {
          content: placementGroup.used_by.length,
          role: "cell",
          "aria-label": "Rigor",
        },
        {
          content: (
            <List
              inline
              className="actions-list"
              items={[
                <Button
                  key="edit"
                  appearance="base"
                  hasIcon
                  title="Edit placement group"
                  onClick={() => {
                    notify.clear();
                    panelParams.openEditPlacementGroup(placementGroup.name);
                  }}
                >
                  <Icon name="edit" />
                </Button>,
                <DeletePlacementGroupBtn
                  placementGroup={placementGroup}
                  project={projectName}
                  key="delete"
                />,
              ]}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right",
        },
      ],
      sortData: {
        name: placementGroup.name.toLowerCase(),
        description: placementGroup.description.toLowerCase(),
        policy: placementGroup.config.policy,
        rigor: placementGroup.config.rigor,
        used_by: placementGroup.used_by.length,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const isEmpty = placementGroups.length === 0;

  return (
    <>
      <CustomLayout
        mainClassName="placement-groups-list"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/howto/cluster_placement_groups/"
                  title="Learn how to use placement groups"
                >
                  Placement groups
                </HelpLink>
              </PageHeader.Title>
            </PageHeader.Left>
            <PageHeader.BaseActions>
              {!isEmpty && (
                <CreatePlacementGroupBtn className="u-no-margin--bottom u-float-right" />
              )}
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row className="no-grid-gap">
          <Col size={12}>
            {isEmpty && (
              <EmptyState
                className="empty-state"
                image={<Icon name="repository" className="empty-state-icon" />}
                title="No placement groups found"
              >
                <p>There are no placement groups in this project.</p>
                <p>
                  <DocLink
                    docPath="/howto/cluster_placement_groups/"
                    hasExternalIcon
                  >
                    Learn how to use placement groups
                  </DocLink>
                </p>
                <CreatePlacementGroupBtn />
              </EmptyState>
            )}
            {!isEmpty && (
              <ScrollableTable
                dependencies={[placementGroups, notify.notification]}
                tableId="placement-group-table"
                belowIds={["status-bar"]}
              >
                <TablePagination
                  id="pagination"
                  data={sortedRows}
                  itemName="placement group"
                  className="u-no-margin--top"
                  aria-label="Table pagination control"
                >
                  <MainTable
                    id="placement-group-table"
                    headers={headers}
                    sortable
                    emptyStateMsg="No placement groups found matching this search"
                    onUpdateSort={updateSort}
                  />
                </TablePagination>
              </ScrollableTable>
            )}
          </Col>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.createPlacementGroup && (
        <CreatePlacementGroupPanel />
      )}
      {panelParams.panel === panels.editPlacementGroup && (
        <EditPlacementGroupPanel />
      )}
    </>
  );
};

export default PlacementGroupList;
