import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  ColumnSelector,
  CustomLayout,
  EmptyState,
  Icon,
  Row,
  ScrollableTable,
  Spinner,
  TablePagination,
  useListener,
  useNotify,
  visibleHeaderColumns,
  visibleRowColumns,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams, { panels } from "util/usePanelParams";
import { useNavigate, useSearchParams } from "react-router-dom";
import { instanceCreationTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import classnames from "classnames";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import SelectableMainTable from "components/SelectableMainTable";
import InstanceBulkActions from "pages/instances/actions/InstanceBulkActions";
import { getIpAddresses } from "util/networks";
import InstanceBulkDelete from "pages/instances/actions/InstanceBulkDelete";
import InstanceSearchFilter from "./InstanceSearchFilter";
import type { InstanceFilters } from "util/instanceFilter";
import { enrichStatuses } from "util/instanceFilter";
import { fetchOperations } from "api/operations";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import type {
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  ACTIONS,
  CLUSTER_MEMBER,
  COLUMN_WIDTHS,
  CREATION_SPAN_COLUMNS,
  DESCRIPTION,
  FILESYSTEM,
  IPV4,
  IPV6,
  MEMORY,
  NAME,
  PROJECT,
  SIZE_HIDEABLE_COLUMNS,
  SNAPSHOTS,
  STATUS,
  TYPE,
  USER_HIDEABLE_COLUMNS,
} from "util/instanceTable";
import { getInstanceName } from "util/operations";
import NotificationRow from "components/NotificationRow";
import SelectedTableNotification from "components/SelectedTableNotification";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import type { LxdInstanceStatus } from "types/instance";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import InstanceDetailPanel from "./InstanceDetailPanel";
import InstanceListIps from "./InstanceListIps";
import {
  mediumScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import InstanceUsageMainMemory from "pages/instances/InstanceUsageMainMemory";
import InstanceUsageRootFilesystem from "pages/instances/InstanceUsageRootFilesystem";
import { useInstances } from "context/useInstances";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import { useIsClustered } from "context/useIsClustered";
import { useProject } from "context/useProjects";
import InstanceClusterMemberChip from "pages/instances/InstanceClusterMemberChip";
import InstanceProjectChip from "pages/instances/InstanceProjectChip";
import { getInstanceKey } from "util/instances";

const loadHidden = () => {
  const saved = localStorage.getItem("instanceListHiddenColumns");
  const validColumns = new Set(USER_HIDEABLE_COLUMNS);
  return saved
    ? (JSON.parse(saved) as string[]).filter((item) => validColumns.has(item))
    : [MEMORY, FILESYSTEM];
};

const saveHidden = (columns: string[]) => {
  localStorage.setItem("instanceListHiddenColumns", JSON.stringify(columns));
};

const InstanceList: FC = () => {
  const docBaseLink = useDocs();
  const instanceLoading = useInstanceLoading();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project, isAllProjects } = useCurrentProject();
  const { data: defaultProject } = useProject("default", isAllProjects);
  const [createButtonLabel, _setCreateButtonLabel] =
    useState<string>("Create instance");
  const [searchParams] = useSearchParams();
  const isClustered = useIsClustered();
  const { canCreateInstances } = useProjectEntitlements();

  const filters: InstanceFilters = {
    queries: searchParams.getAll("query"),
    statuses: enrichStatuses(
      searchParams.getAll("status") as LxdInstanceStatus[],
    ),
    types: searchParams
      .getAll("type")
      .map((value) => (value === "VM" ? "virtual-machine" : "container")),
    profiles: searchParams.getAll("profile"),
    clusterMembers: searchParams.getAll("member"),
    projects: searchParams.getAll("project"),
  };
  const [userHidden, setUserHidden] = useState<string[]>(loadHidden());
  const [sizeHidden, setSizeHidden] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const isSmallScreen = useIsScreenBelow();
  const isMediumScreen = useIsScreenBelow(mediumScreenBreakpoint);

  if (!project && !isAllProjects) {
    return <>Missing project</>;
  }

  useEffect(() => {
    if (isClustered || !userHidden.includes(CLUSTER_MEMBER)) {
      return;
    }
    setUserHidden(userHidden.filter((col) => col !== CLUSTER_MEMBER));
  }, [isClustered]);

  const {
    data: instances = [],
    error,
    isLoading,
  } = useInstances(project?.name ?? null);

  if (error) {
    notify.failure("Loading instances failed", error);
  }

  const setCreateButtonLabel = () => {
    _setCreateButtonLabel(isMediumScreen ? "Create" : "Create instance");
  };
  useListener(window, setCreateButtonLabel, "resize", true);

  const forceReflow = () => {
    // fixing a layout bug in safari when resizing the window
    // we shrink the window with the instance detail panel open and
    // without this, the first column is taken too much space
    const table = document.getElementById("instances-table");
    if (!table) {
      return;
    }
    table.style.display = "none";
    table.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-expressions
    table.style.display = "table";
  };
  useListener(window, forceReflow, "resize", true);

  const setHidden = (columns: string[]) => {
    setUserHidden(columns);
    saveHidden(columns);
  };

  const { data: operationList } = useQuery({
    queryKey: [queryKeys.operations, project?.name],
    queryFn: async () => fetchOperations(project?.name ?? null),
  });

  if (error) {
    notify.failure("Loading operations failed", error);
  }

  const creationNames: string[] = [];
  const creationOperations = (operationList?.running ?? [])
    .concat(operationList?.success ?? [])
    .filter((operation) => {
      const name = getInstanceName(operation);
      const isCreating = operation.description === "Creating instance";
      const isProcessing = processingNames.includes(name);
      if (!isCreating || isProcessing) {
        return false;
      }
      const isInInstanceList = instances.some((item) => item.name === name);
      const isRunning = operation.status === "Running";

      if (!isRunning && isInInstanceList) {
        return false;
      }

      creationNames.push(name);
      return true;
    });

  const filteredInstances = instances.filter((item) => {
    if (creationNames.includes(item.name)) {
      return false;
    }
    if (
      !filters.queries.every(
        (q) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.config["image.description"]?.toLowerCase().includes(q),
      )
    ) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(item.status)
    ) {
      return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(item.type)) {
      return false;
    }
    if (
      filters.profiles.length > 0 &&
      !filters.profiles.every((profile) => item.profiles.includes(profile))
    ) {
      return false;
    }
    if (
      filters.clusterMembers.length > 0 &&
      !filters.clusterMembers.includes(item.location)
    ) {
      return false;
    }
    if (
      filters.projects.length > 0 &&
      !filters.projects.includes(item.project)
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const validKeys = new Set(filteredInstances.map(getInstanceKey));
    const validSelections = selectedNames.filter((name) => validKeys.has(name));
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [filteredInstances]);

  useEffect(() => {
    if (panelParams.instance) {
      if (
        !instances.some(
          (instance) =>
            instance.name === panelParams.instance &&
            instance.project === panelParams.project,
        )
      ) {
        panelParams.clear();
      }
    }
  }, [instances]);

  const headers: MainTableHeader[] = [
    {
      content: NAME,
      sortKey: "name",
      style: { width: `${COLUMN_WIDTHS[NAME]}px` },
    },
    {
      content: TYPE,
      sortKey: "type",
      style: { width: `${COLUMN_WIDTHS[TYPE]}px` },
    },
    ...(isAllProjects
      ? [
          {
            content: PROJECT,
            sortKey: "project",
            style: { width: `${COLUMN_WIDTHS[PROJECT]}px` },
          },
        ]
      : []),
    ...(isClustered
      ? [
          {
            content: CLUSTER_MEMBER,
            sortKey: "member",
            style: { width: `${COLUMN_WIDTHS[CLUSTER_MEMBER]}px` },
          },
        ]
      : []),
    {
      content: MEMORY,
      style: { width: `${COLUMN_WIDTHS[MEMORY]}px` },
    },
    {
      content: FILESYSTEM,
      style: { width: `${COLUMN_WIDTHS[FILESYSTEM]}px` },
    },
    {
      content: DESCRIPTION,
      sortKey: "description",
      style: { width: `${COLUMN_WIDTHS[DESCRIPTION]}px` },
    },
    {
      content: IPV4,
      className: "u-align--right",
      style: { width: `${COLUMN_WIDTHS[IPV4]}px` },
    },
    {
      content: IPV6,
      id: "header-ipv6",
      style: { width: `${COLUMN_WIDTHS[IPV6]}px` },
    },
    {
      content: SNAPSHOTS,
      sortKey: "snapshots",
      className: "u-align--right",
      style: { width: `${COLUMN_WIDTHS[SNAPSHOTS]}px` },
    },
    {
      content: STATUS,
      sortKey: "status",
      className: "status-header status",
      style: { width: `${COLUMN_WIDTHS[STATUS]}px` },
    },
    {
      "aria-label": "Actions",
      className: classnames({ "u-hide": panelParams.instance }),
      style: { width: `${COLUMN_WIDTHS[ACTIONS]}px` },
    },
  ];

  const visibleHeaders = visibleHeaderColumns(
    headers,
    userHidden.concat(sizeHidden),
  );

  const getRows = (hiddenCols: string[]): MainTableRow[] => {
    const spannedWidth = CREATION_SPAN_COLUMNS.filter(
      (col) => !hiddenCols.includes(col),
    )
      .concat(...(isClustered ? [CLUSTER_MEMBER] : []))
      .concat(...(isAllProjects ? [PROJECT] : []))
      .reduce((partialSum, col) => partialSum + COLUMN_WIDTHS[col], 0);

    const totalColumnCount = visibleHeaders.length;

    const creationRows: MainTableRow[] = creationOperations.map((operation) => {
      return {
        key: operation.id,
        className: "u-row",
        columns: [
          {
            content: getInstanceName(operation),
            className: "u-truncate",
            title: getInstanceName(operation),
            role: "rowheader",
            "aria-label": NAME,
            style: { width: `${COLUMN_WIDTHS[NAME]}px` },
          },
          ...(totalColumnCount > 3
            ? [
                {
                  content: (
                    <i key={JSON.stringify(operation.metadata ?? {})}>
                      {Object.entries(operation.metadata ?? {})
                        .slice(0, 1)
                        .map(([key, value], index) => (
                          <div key={index}>
                            {key}: {value}
                          </div>
                        ))}
                    </i>
                  ),
                  role: "cell",
                  colSpan: totalColumnCount - 3,
                  style: { width: `${spannedWidth}px` },
                },
              ]
            : []),
          ...(sizeHidden.includes(STATUS)
            ? []
            : [
                {
                  content: (
                    <>
                      <Spinner className="status-icon" /> Setting up
                    </>
                  ),
                  role: "cell",
                  "aria-label": STATUS,
                  style: { width: `${COLUMN_WIDTHS[STATUS]}px` },
                },
              ]),
          {
            content: (
              <CancelOperationBtn
                operation={operation}
                project={project?.name}
              />
            ),
            role: "cell",
            className: classnames("u-align--right", {
              "u-hide": panelParams.instance,
            }),
            "aria-label": "Actions",
            style: { width: `${COLUMN_WIDTHS[ACTIONS]}px` },
          },
        ],
        sortData: {
          name: null, // we want the creating instances always on top
        },
      };
    });

    const instanceRows: MainTableRow[] = filteredInstances.map((instance) => {
      const openSummary = () => {
        panelParams.openInstanceSummary(instance.name, instance.project);
      };

      const ipv4 = getIpAddresses(instance, "inet")
        .filter((val) => !val.address.startsWith("127"))
        .map((val) => val.address);
      const ipv6 = getIpAddresses(instance, "inet6")
        .filter((val) => !val.address.startsWith("fe80"))
        .map((val) => val.address);

      const loadingType = instanceLoading.getType(instance);

      const hasActivePanel =
        panelParams.instance === instance.name &&
        panelParams.project === instance.project;

      return {
        key: getInstanceKey(instance),
        className: hasActivePanel ? "u-row-selected" : "u-row",
        name: getInstanceKey(instance),
        columns: [
          {
            content: <InstanceLink instance={instance} />,
            className: "u-truncate",
            title: `Instance ${instance.name}`,
            role: "rowheader",
            style: { width: `${COLUMN_WIDTHS[NAME]}px` },
            "aria-label": NAME,
            onClick: openSummary,
          },
          {
            content: (
              <>
                {
                  instanceCreationTypes.find(
                    (item) => item.value === instance.type,
                  )?.label
                }
              </>
            ),
            role: "cell",
            "aria-label": TYPE,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[TYPE]}px` },
          },
          ...(isAllProjects
            ? [
                {
                  content: <InstanceProjectChip instance={instance} />,
                  role: "cell",
                  "aria-label": PROJECT,
                  style: { width: `${COLUMN_WIDTHS[PROJECT]}px` },
                },
              ]
            : []),
          ...(isClustered
            ? [
                {
                  content: <InstanceClusterMemberChip instance={instance} />,
                  role: "cell",
                  "aria-label": CLUSTER_MEMBER,
                  style: { width: `${COLUMN_WIDTHS[CLUSTER_MEMBER]}px` },
                },
              ]
            : []),
          {
            content: <InstanceUsageMainMemory instance={instance} />,
            role: "cell",
            "aria-label": MEMORY,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[MEMORY]}px` },
          },
          {
            content: <InstanceUsageRootFilesystem instance={instance} />,
            role: "cell",
            "aria-label": FILESYSTEM,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[FILESYSTEM]}px` },
          },
          {
            content: (
              <div className="u-truncate" title={instance.description}>
                {instance.description}
              </div>
            ),
            role: "cell",
            "aria-label": DESCRIPTION,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[DESCRIPTION]}px` },
          },
          {
            key: `ipv4-${ipv4.length}`,
            content: <InstanceListIps ips={ipv4} />,
            role: "cell",
            className: "u-align--right clickable-cell",
            "aria-label": IPV4,
            onClick: openSummary,
            style: { width: `${COLUMN_WIDTHS[IPV4]}px` },
          },
          {
            key: `ipv6-${ipv6.length}`,
            content: <InstanceListIps ips={ipv6} />,
            role: "cell",
            "aria-label": IPV6,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[IPV6]}px` },
          },
          {
            content: instance.snapshots?.length ?? "0",
            role: "cell",
            className: "u-align--right clickable-cell",
            "aria-label": SNAPSHOTS,
            onClick: openSummary,
            style: { width: `${COLUMN_WIDTHS[SNAPSHOTS]}px` },
          },
          {
            key: instance.status + loadingType,
            content: <InstanceStatusIcon instance={instance} />,
            role: "cell",
            className: "clickable-cell",
            "aria-label": STATUS,
            onClick: openSummary,
            style: { width: `${COLUMN_WIDTHS[STATUS]}px` },
          },
          {
            content: (
              <InstanceStateActions
                className={classnames(
                  "instance-actions",
                  "u-no-margin--bottom",
                )}
                instance={instance}
              />
            ),
            role: "cell",
            className: classnames("u-align--right", {
              "u-hide": panelParams.instance,
            }),
            "aria-label": "Actions",
            style: { width: `${COLUMN_WIDTHS[ACTIONS]}px` },
          },
        ],
        sortData: {
          name: instance.name.toLowerCase(),
          member: instance.location,
          description: instance.description.toLowerCase(),
          status: instance.status,
          type: instance.type,
          snapshots: instance.snapshots?.length ?? 0,
          project: instance.project,
        },
      };
    });

    return visibleRowColumns(creationRows.concat(instanceRows), hiddenCols);
  };

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows: getRows(userHidden.concat(sizeHidden)),
  });

  const figureSizeHidden = () => {
    const wrapper = document.getElementById("instance-table-measure");
    const tableHead = wrapper?.children[0]?.children[0]?.children[0];

    if (!wrapper || !tableHead) {
      return;
    }

    const wrapWidth = wrapper.getBoundingClientRect().width;
    const tableWidth = tableHead.getBoundingClientRect().width;
    const colWidth = new Map();
    tableHead.childNodes.forEach((item) => {
      const col = item as Element;
      const name = col.innerHTML;
      const width = col.getBoundingClientRect().width;
      colWidth.set(name, width);
    });

    let gainedSpace = 0;
    const sizeHiddenNew: string[] = [];
    SIZE_HIDEABLE_COLUMNS.forEach((column) => {
      if (column === CLUSTER_MEMBER && !isClustered) {
        return;
      }
      if (
        tableWidth - gainedSpace > wrapWidth &&
        !userHidden.includes(column)
      ) {
        gainedSpace += colWidth.get(column);
        sizeHiddenNew.push(column);
      }
    });
    if (JSON.stringify(sizeHiddenNew) !== JSON.stringify(sizeHidden)) {
      setSizeHidden(sizeHiddenNew);
    }
  };
  useListener(window, figureSizeHidden, "resize", true);
  useEffect(figureSizeHidden, [
    panelParams.instance,
    userHidden,
    instances,
    creationOperations,
  ]);

  const hasInstances =
    isLoading || instances.length > 0 || creationOperations.length > 0;
  const selectedInstances = instances.filter((instance) =>
    selectedNames.includes(getInstanceKey(instance)),
  );
  const totalInstanceCount =
    instances.filter((item) => !creationNames.includes(item.name)).length +
    creationOperations.length;

  const projectForCreation = isAllProjects ? defaultProject : project;
  const projectForCreationName = projectForCreation?.name ?? "default";
  const createInstanceRestriction = canCreateInstances(projectForCreation)
    ? ""
    : `You do not have permission to create instances in project ${projectForCreationName}`;

  return (
    <>
      <CustomLayout
        mainClassName={classnames("instance-list", {
          "has-side-panel": Boolean(panelParams.instance),
        })}
        contentClassName="instance-content"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  href={`${docBaseLink}/explanation/instances/#expl-instances`}
                  title="Learn more about instances"
                >
                  Instances
                </HelpLink>
              </PageHeader.Title>
              {hasInstances && selectedNames.length === 0 && (
                <PageHeader.Search>
                  <InstanceSearchFilter
                    key={`${project?.name ?? ""}-${searchParams.get("search")}`}
                    instances={instances}
                    hasProjectFilter={isAllProjects}
                  />
                </PageHeader.Search>
              )}
              {selectedNames.length > 0 && (
                <>
                  <InstanceBulkActions
                    instances={selectedInstances}
                    onStart={() => {
                      setProcessingNames(selectedNames);
                    }}
                    onFinish={() => {
                      setProcessingNames([]);
                    }}
                  />
                  <InstanceBulkDelete
                    instances={selectedInstances}
                    onStart={setProcessingNames}
                    onFinish={() => {
                      setProcessingNames([]);
                    }}
                  />
                </>
              )}
            </PageHeader.Left>
            {hasInstances && selectedNames.length === 0 && (
              <PageHeader.BaseActions>
                <Button
                  appearance="positive"
                  className="u-float-right u-no-margin--bottom"
                  onClick={async () =>
                    navigate(
                      `/ui/project/${encodeURIComponent(projectForCreationName)}/instances/create`,
                    )
                  }
                  hasIcon={!isSmallScreen}
                  disabled={!!createInstanceRestriction}
                  title={createInstanceRestriction}
                >
                  {!isSmallScreen && <Icon name="plus" light />}
                  <span>{createButtonLabel}</span>
                </Button>
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row className="no-grid-gap">
          <Col size={12}>
            {hasInstances && (
              <>
                <ScrollableTable
                  dependencies={[filteredInstances, notify.notification]}
                  tableId="instances-table"
                  belowIds={["status-bar"]}
                >
                  <TablePagination
                    data={sortedRows}
                    id="pagination"
                    itemName="instance"
                    className="u-no-margin--top"
                    aria-label="Table pagination control"
                    description={
                      selectedNames.length > 0 && (
                        <SelectedTableNotification
                          totalCount={totalInstanceCount}
                          itemName="instance"
                          parentName={
                            project ? `project: ${project?.name}` : undefined
                          }
                          selectedNames={selectedNames}
                          setSelectedNames={setSelectedNames}
                          filteredNames={filteredInstances.map(getInstanceKey)}
                        />
                      )
                    }
                  >
                    <ColumnSelector
                      columns={USER_HIDEABLE_COLUMNS.filter((column) => {
                        if (column === CLUSTER_MEMBER && !isClustered) {
                          return false;
                        }
                        return true;
                      })}
                      userHidden={userHidden}
                      sizeHidden={sizeHidden}
                      setUserHidden={setHidden}
                      className={classnames({
                        "u-hide": panelParams.instance,
                      })}
                    />
                    <SelectableMainTable
                      id="instances-table"
                      headers={visibleHeaders}
                      rows={sortedRows}
                      sortable
                      emptyStateMsg={
                        isLoading ? (
                          <Spinner
                            className="u-loader"
                            text="Loading instances..."
                          />
                        ) : (
                          <>No instance found matching this search</>
                        )
                      }
                      itemName="instance"
                      parentName="project"
                      selectedNames={selectedNames}
                      setSelectedNames={setSelectedNames}
                      disabledNames={processingNames}
                      filteredNames={filteredInstances.map(getInstanceKey)}
                      onUpdateSort={updateSort}
                    />
                  </TablePagination>
                </ScrollableTable>
                <div id="instance-table-measure">
                  <SelectableMainTable
                    headers={visibleHeaderColumns(headers, userHidden)}
                    rows={getRows(userHidden)}
                    className="scrollable-table"
                    itemName="instance"
                    parentName="project"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    disabledNames={processingNames}
                    filteredNames={filteredInstances.map(getInstanceKey)}
                  />
                </div>
              </>
            )}
            {!hasInstances && (
              <EmptyState
                className="empty-state"
                image={<Icon name="pods" className="empty-state-icon" />}
                title="No instances found"
              >
                <p>
                  There are no instances in {project ? "this" : "any"} project.
                  {canCreateInstances(project)
                    ? " Spin up your first instance!"
                    : ""}
                </p>
                <p>
                  <a
                    href={`${docBaseLink}/howto/instances_create/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    How to create instances
                    <Icon className="external-link-icon" name="external-link" />
                  </a>
                </p>
                <Button
                  className="empty-state-button"
                  appearance="positive"
                  onClick={async () =>
                    navigate(
                      `/ui/project/${encodeURIComponent(projectForCreationName)}/instances/create`,
                    )
                  }
                  disabled={!!createInstanceRestriction}
                  title={createInstanceRestriction}
                >
                  Create instance
                </Button>
              </EmptyState>
            )}
          </Col>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.instanceSummary && <InstanceDetailPanel />}
    </>
  );
};

export default InstanceList;
