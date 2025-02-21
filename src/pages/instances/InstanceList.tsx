import { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  EmptyState,
  Icon,
  Row,
  Spinner,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams, { panels } from "util/usePanelParams";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "components/Loader";
import { instanceCreationTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import TableColumnsSelect from "components/TableColumnsSelect";
import useEventListener from "util/useEventListener";
import classnames from "classnames";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import SelectableMainTable from "components/SelectableMainTable";
import InstanceBulkActions from "pages/instances/actions/InstanceBulkActions";
import { getIpAddresses } from "util/networks";
import InstanceBulkDelete from "pages/instances/actions/InstanceBulkDelete";
import InstanceSearchFilter from "./InstanceSearchFilter";
import { InstanceFilters, enrichStatuses } from "util/instanceFilter";
import { isWidthBelow } from "util/helpers";
import { fetchOperations } from "api/operations";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  ACTIONS,
  COLUMN_WIDTHS,
  CREATION_SPAN_COLUMNS,
  DESCRIPTION,
  IPV4,
  IPV6,
  CLUSTER_MEMBER,
  NAME,
  SIZE_HIDEABLE_COLUMNS,
  SNAPSHOTS,
  STATUS,
  TYPE,
  MEMORY,
  DISK,
} from "util/instanceTable";
import { getInstanceName } from "util/operations";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import SelectedTableNotification from "components/SelectedTableNotification";
import CustomLayout from "components/CustomLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import type { LxdInstanceStatus } from "types/instance";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import InstanceDetailPanel from "./InstanceDetailPanel";
import { useSmallScreen } from "context/useSmallScreen";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";
import InstanceUsageMemory from "pages/instances/InstanceUsageMemory";
import InstanceUsageDisk from "pages/instances/InstanceDisk";
import { useInstances } from "context/useInstances";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";

const loadHidden = () => {
  const saved = localStorage.getItem("instanceListHiddenColumns");
  return saved ? (JSON.parse(saved) as string[]) : [MEMORY, DISK];
};

const saveHidden = (columns: string[]) => {
  localStorage.setItem("instanceListHiddenColumns", JSON.stringify(columns));
};

const isMediumScreen = () => isWidthBelow(820);

const InstanceList: FC = () => {
  const docBaseLink = useDocs();
  const instanceLoading = useInstanceLoading();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project } = useCurrentProject();
  const [createButtonLabel, _setCreateButtonLabel] =
    useState<string>("Create instance");
  const [searchParams] = useSearchParams();
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
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
  };
  const [userHidden, setUserHidden] = useState<string[]>(loadHidden());
  const [sizeHidden, setSizeHidden] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const isSmallScreen = useSmallScreen();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: instances = [], error, isLoading } = useInstances(project.name);

  if (error) {
    notify.failure("Loading instances failed", error);
  }

  const setCreateButtonLabel = () => {
    _setCreateButtonLabel(isMediumScreen() ? "Create" : "Create instance");
  };
  useEventListener("resize", setCreateButtonLabel);

  const setHidden = (columns: string[]) => {
    setUserHidden(columns);
    saveHidden(columns);
  };

  const { data: operationList } = useQuery({
    queryKey: [queryKeys.operations, project],
    queryFn: () => fetchOperations(project.name),
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
    return true;
  });

  useEffect(() => {
    const validNames = new Set(
      filteredInstances.map((instance) => instance.name),
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [filteredInstances]);

  useEffect(() => {
    if (panelParams.instance) {
      if (
        !instances.some((instance) => instance.name === panelParams.instance)
      ) {
        panelParams.clear();
      }
    }
  }, [instances]);

  const getHeaders = (hiddenCols: string[]) =>
    [
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
        content: DISK,
        style: { width: `${COLUMN_WIDTHS[DISK]}px` },
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
    ].filter(
      (item) =>
        typeof item.content !== "string" || !hiddenCols.includes(item.content),
    );

  const getRows = (hiddenCols: string[]): MainTableRow[] => {
    const spannedWidth = CREATION_SPAN_COLUMNS.filter(
      (col) => !hiddenCols.includes(col),
    )
      .concat(...(isClustered ? [CLUSTER_MEMBER] : []))
      .reduce((partialSum, col) => partialSum + COLUMN_WIDTHS[col], 0);

    const totalColumnCount = getHeaders(userHidden.concat(sizeHidden)).length;

    const creationRows: MainTableRow[] = creationOperations.map((operation) => {
      return {
        key: operation.id,
        className: "u-row",
        columns: [
          {
            content: getInstanceName(operation),
            className: "u-truncate",
            title: getInstanceName(operation),
            role: "cell",
            "aria-label": NAME,
            style: { width: `${COLUMN_WIDTHS[NAME]}px` },
          },
          ...(totalColumnCount > 3
            ? [
                {
                  content: (
                    <i>
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
                project={project.name}
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
      const openSummary = () =>
        panelParams.openInstanceSummary(instance.name, project.name);

      const ipv4 = getIpAddresses(instance, "inet")
        .filter((val) => !val.address.startsWith("127"))
        .map((val) => val.address);
      const ipv6 = getIpAddresses(instance, "inet6")
        .filter((val) => !val.address.startsWith("fe80"))
        .map((val) => val.address);

      return {
        key: instance.name,
        className:
          panelParams.instance === instance.name ? "u-row-selected" : "u-row",
        name: instance.name,
        columns: [
          {
            content: <InstanceLink instance={instance} />,
            className: "u-truncate",
            title: `Instance ${instance.name}`,
            role: "cell",
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
          ...(isClustered
            ? [
                {
                  content: instance.location,
                  role: "cell",
                  "aria-label": CLUSTER_MEMBER,
                  onClick: openSummary,
                  className: "clickable-cell u-truncate",
                  title: instance.location,
                  style: { width: `${COLUMN_WIDTHS[CLUSTER_MEMBER]}px` },
                },
              ]
            : []),
          {
            content: <InstanceUsageMemory instance={instance} />,
            role: "cell",
            "aria-label": MEMORY,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[MEMORY]}px` },
          },
          {
            content: <InstanceUsageDisk instance={instance} />,
            role: "cell",
            "aria-label": DISK,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[DISK]}px` },
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
            content: ipv4.length > 1 ? `${ipv4.length} addresses` : ipv4,
            role: "cell",
            className: "u-align--right clickable-cell",
            "aria-label": IPV4,
            onClick: openSummary,
            style: { width: `${COLUMN_WIDTHS[IPV4]}px` },
          },
          {
            content: ipv6.length > 1 ? `${ipv6.length} addresses` : ipv6,
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
                  {
                    "u-hide": Boolean(instanceLoading.getType(instance)),
                  },
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
        ].filter((item) => !hiddenCols.includes(item["aria-label"])),
        sortData: {
          name: instance.name.toLowerCase(),
          member: instance.location,
          description: instance.description.toLowerCase(),
          status: instance.status,
          type: instance.type,
          snapshots: instance.snapshots?.length ?? 0,
        },
      };
    });

    return creationRows.concat(instanceRows);
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
  useEventListener("resize", figureSizeHidden);
  useEffect(figureSizeHidden, [
    panelParams.instance,
    userHidden,
    instances,
    creationOperations,
  ]);

  const hasInstances =
    isLoading || instances.length > 0 || creationOperations.length > 0;
  const selectedInstances = instances.filter((instance) =>
    selectedNames.includes(instance.name),
  );
  const totalInstanceCount =
    instances.filter((item) => !creationNames.includes(item.name)).length +
    creationOperations.length;

  const createInstanceRestriction = canCreateInstances(project)
    ? ""
    : `You do not have permission to create instances in project ${project.name}`;

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
                    key={project.name}
                    instances={instances}
                  />
                </PageHeader.Search>
              )}
              {selectedNames.length > 0 && (
                <>
                  <InstanceBulkActions
                    instances={selectedInstances}
                    onStart={() => setProcessingNames(selectedNames)}
                    onFinish={() => setProcessingNames([])}
                  />
                  <InstanceBulkDelete
                    instances={selectedInstances}
                    onStart={setProcessingNames}
                    onFinish={() => setProcessingNames([])}
                  />
                </>
              )}
            </PageHeader.Left>
            {hasInstances && selectedNames.length === 0 && (
              <PageHeader.BaseActions>
                <Button
                  appearance="positive"
                  className="u-float-right u-no-margin--bottom"
                  onClick={() =>
                    void navigate(
                      `/ui/project/${project.name}/instances/create`,
                    )
                  }
                  hasIcon={!isSmallScreen}
                  disabled={!canCreateInstances(project)}
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
                          parentName={`project: ${project.name}`}
                          selectedNames={selectedNames}
                          setSelectedNames={setSelectedNames}
                          filteredNames={filteredInstances.map(
                            (instance) => instance.name,
                          )}
                        />
                      )
                    }
                  >
                    <TableColumnsSelect
                      columns={[
                        TYPE,
                        MEMORY,
                        DISK,
                        CLUSTER_MEMBER,
                        DESCRIPTION,
                        IPV4,
                        IPV6,
                        SNAPSHOTS,
                      ]}
                      hidden={userHidden}
                      sizeHidden={sizeHidden}
                      setHidden={setHidden}
                      className={classnames({
                        "u-hide": panelParams.instance,
                      })}
                    />
                    <SelectableMainTable
                      id="instances-table"
                      headers={getHeaders(userHidden.concat(sizeHidden))}
                      rows={sortedRows}
                      sortable
                      emptyStateMsg={
                        isLoading ? (
                          <Loader text="Loading instances..." />
                        ) : (
                          <>No instance found matching this search</>
                        )
                      }
                      itemName="instance"
                      parentName="project"
                      selectedNames={selectedNames}
                      setSelectedNames={setSelectedNames}
                      disabledNames={processingNames}
                      filteredNames={filteredInstances.map(
                        (instance) => instance.name,
                      )}
                      onUpdateSort={updateSort}
                    />
                  </TablePagination>
                </ScrollableTable>
                <div id="instance-table-measure">
                  <SelectableMainTable
                    headers={getHeaders(userHidden)}
                    rows={getRows(userHidden)}
                    className="scrollable-table"
                    itemName="instance"
                    parentName="project"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    disabledNames={processingNames}
                    filteredNames={filteredInstances.map(
                      (instance) => instance.name,
                    )}
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
                  There are no instances in this project. Spin up your first
                  instance!
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
                  onClick={() =>
                    void navigate(
                      `/ui/project/${project.name}/instances/create`,
                    )
                  }
                  disabled={!canCreateInstances(project)}
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
