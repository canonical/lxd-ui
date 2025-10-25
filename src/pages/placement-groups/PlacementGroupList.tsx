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
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import { usePlacementGroups } from "context/usePlacementGroups";
import usePanelParams, { panels } from "util/usePanelParams";
import CreatePlacementGroupPanel from "pages/placement-groups/panels/CreatePlacementGroupPanel";
import EditPlacementGroupPanel from "pages/placement-groups/panels/EditPlacementGroupPanel";
import DeletePlacementGroupBtn from "pages/placement-groups/actions/DeletePlacementGroupBtn";
import {
  smallScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";

const PlacementGroupList: FC = () => {
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const notify = useNotify();
  const { project: projectName } = useParams<{ project: string }>();
  const isSmallScreen = useIsScreenBelow(smallScreenBreakpoint);

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
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <>
      <CustomLayout
        mainClassName="placement-groups-list"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  href={`${docBaseLink}/howto/cluster_placement_groups/`}
                  title="Learn how to use placement groups"
                >
                  Placement groups
                </HelpLink>
              </PageHeader.Title>
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <Button
                appearance="positive"
                className="u-no-margin--bottom u-float-right"
                onClick={() => {
                  panelParams.openCreatePlacementGroup();
                }}
                hasIcon={!isSmallScreen}
              >
                {!isSmallScreen && <Icon name="plus" light />}
                <span>Create placement group</span>
              </Button>
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row className="no-grid-gap">
          <Col size={12}>
            {placementGroups.length === 0 && (
              <EmptyState
                className="empty-state"
                image={<Icon name="repository" className="empty-state-icon" />}
                title="No placement groups found"
              >
                <p>There are no placement groups in this project.</p>
              </EmptyState>
            )}
            {placementGroups.length > 0 && (
              <ScrollableTable
                dependencies={[placementGroups, notify.notification]}
                tableId="placement group-table"
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
                    id="profile-table"
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
