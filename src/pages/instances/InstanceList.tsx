import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  EmptyState,
  Icon,
  Row,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { fetchInstances } from "api/instances";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "components/Loader";
import { instanceCreationTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import TableColumnsSelect from "components/TableColumnsSelect";
import useEventListener from "@use-it/event-listener";
import classnames from "classnames";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import Pagination from "components/Pagination";
import { usePagination } from "util/pagination";
import SelectableMainTable from "components/SelectableMainTable";
import InstanceBulkActions from "pages/instances/actions/InstanceBulkActions";
import { getIpAddresses } from "util/networks";
import InstanceBulkDelete from "pages/instances/actions/InstanceBulkDelete";
import InstanceSearchFilter from "./InstanceSearchFilter";
import { InstanceFilters } from "util/instanceFilter";
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
  NAME,
  SIZE_HIDEABLE_COLUMNS,
  SNAPSHOTS,
  STATUS,
  TYPE,
} from "util/instanceTable";
import { getInstanceName } from "util/operations";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";

const loadHidden = () => {
  const saved = localStorage.getItem("instanceListHiddenColumns");
  return saved ? (JSON.parse(saved) as string[]) : [];
};

const saveHidden = (columns: string[]) => {
  localStorage.setItem("instanceListHiddenColumns", JSON.stringify(columns));
};

const isMediumScreen = () => isWidthBelow(820);

const InstanceList: FC = () => {
  const instanceLoading = useInstanceLoading();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project } = useParams<{ project: string }>();
  const [createButtonLabel, _setCreateButtonLabel] =
    useState<string>("Create instance");
  const [filters, setFilters] = useState<InstanceFilters>({
    queries: [],
    statuses: [],
    types: [],
    profileQueries: [],
  });
  const [userHidden, setUserHidden] = useState<string[]>(loadHidden());
  const [sizeHidden, setSizeHidden] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: instances = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, project],
    queryFn: () => fetchInstances(project),
  });

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

  const filteredInstances = instances.filter((item) => {
    if (
      !filters.queries.every(
        (q) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.config["image.description"]?.toLowerCase().includes(q)
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
      filters.profileQueries.length > 0 &&
      !filters.profileQueries.every((profile) =>
        item.profiles.includes(profile)
      )
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const validNames = new Set(
      filteredInstances.map((instance) => instance.name)
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name)
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [filteredInstances]);

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
        typeof item.content !== "string" || !hiddenCols.includes(item.content)
    );

  const { data: operationList } = useQuery({
    queryKey: [queryKeys.operations, project],
    queryFn: () => fetchOperations(project),
    refetchInterval: 1000,
  });

  if (error) {
    notify.failure("Loading operations failed", error);
  }

  const instanceNames = instances.map((instance) => instance.name);
  const creationOperations = (operationList?.running ?? []).filter(
    (operation) => {
      const createInstanceName = getInstanceName(operation);
      return (
        operation.description === "Creating instance" &&
        !instanceNames.includes(createInstanceName)
      );
    }
  );

  const getRows = (hiddenCols: string[]): MainTableRow[] => {
    const spannedWidth = CREATION_SPAN_COLUMNS.filter(
      (col) => !hiddenCols.includes(col)
    ).reduce((partialSum, col) => partialSum + COLUMN_WIDTHS[col], 0);

    const creationRows: MainTableRow[] = creationOperations.map((operation) => {
      return {
        className: "u-row",
        columns: [
          {
            content: getInstanceName(operation),
            role: "rowheader",
            "aria-label": NAME,
            style: { width: `${COLUMN_WIDTHS[NAME]}px` },
          },
          ...(hiddenCols.length < 5
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
                  role: "rowheader",
                  colSpan: 5 - hiddenCols.length,
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
                  role: "rowheader",
                  "aria-label": STATUS,
                  style: { width: `${COLUMN_WIDTHS[STATUS]}px` },
                },
              ]),
          {
            content: (
              <CancelOperationBtn operation={operation} project={project} />
            ),
            role: "rowheader",
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
        panelParams.openInstanceSummary(instance.name, project);

      const ipv4 = getIpAddresses(instance, "inet").filter(
        (val) => !val.startsWith("127")
      );
      const ipv6 = getIpAddresses(instance, "inet6").filter(
        (val) => !val.startsWith("fe80")
      );

      return {
        className:
          panelParams.instance === instance.name ? "u-row-selected" : "u-row",
        name: instance.name,
        columns: [
          {
            content: (
              <div className="u-truncate" title={instance.name}>
                <InstanceLink instance={instance} />
              </div>
            ),
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
                    (item) => item.value === instance.type
                  )?.label
                }
              </>
            ),
            role: "rowheader",
            "aria-label": TYPE,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[TYPE]}px` },
          },
          {
            content: (
              <div className="u-truncate" title={instance.description}>
                {instance.description}
              </div>
            ),
            role: "rowheader",
            "aria-label": DESCRIPTION,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[DESCRIPTION]}px` },
          },
          {
            content: ipv4.length > 1 ? `${ipv4.length} addresses` : ipv4,
            role: "rowheader",
            className: "u-align--right clickable-cell",
            "aria-label": IPV4,
            onClick: openSummary,
            style: { width: `${COLUMN_WIDTHS[IPV4]}px` },
          },
          {
            content: ipv6.length > 1 ? `${ipv6.length} addresses` : ipv6,
            role: "rowheader",
            "aria-label": IPV6,
            onClick: openSummary,
            className: "clickable-cell",
            style: { width: `${COLUMN_WIDTHS[IPV6]}px` },
          },
          {
            content: instance.snapshots?.length ?? "0",
            role: "rowheader",
            className: "u-align--right clickable-cell",
            "aria-label": SNAPSHOTS,
            onClick: openSummary,
            style: { width: `${COLUMN_WIDTHS[SNAPSHOTS]}px` },
          },
          {
            content: <InstanceStatusIcon instance={instance} />,
            role: "rowheader",
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
                  }
                )}
                instance={instance}
              />
            ),
            role: "rowheader",
            className: classnames("u-align--right", {
              "u-hide": panelParams.instance,
            }),
            "aria-label": "Actions",
            style: { width: `${COLUMN_WIDTHS[ACTIONS]}px` },
          },
        ].filter((item) => !hiddenCols.includes(item["aria-label"])),
        sortData: {
          name: instance.name.toLowerCase(),
          description: instance.description.toLowerCase(),
          status: instance.status,
          type: instance.type,
          snapshots: instance.snapshots?.length ?? 0,
        },
      };
    });

    return creationRows.concat(instanceRows);
  };

  const pagination = usePagination(getRows(userHidden.concat(sizeHidden)));

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
    selectedNames.includes(instance.name)
  );

  return (
    <main className="l-main instance-list">
      <div
        className={classnames("p-panel", {
          "has-side-panel": !!panelParams.instance,
        })}
      >
        <div className="p-panel__header instance-list-header">
          <div className="instance-header-left">
            <h1 className="p-heading--4 u-no-margin--bottom">Instances</h1>
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
                <Button
                  appearance="link"
                  className="clear-selection-btn u-no-margin--bottom u-no-padding--top"
                  hasIcon
                  onClick={() => setSelectedNames([])}
                >
                  <span>Clear selection</span>
                  <Icon name="close" className="clear-selection-icon" />
                </Button>
              </>
            )}
            {hasInstances && selectedNames.length === 0 && (
              <InstanceSearchFilter
                key={project}
                instances={instances}
                setFilters={setFilters}
              />
            )}
          </div>
          {hasInstances && selectedNames.length === 0 && (
            <div className="create-button-wrapper">
              <Button
                appearance="positive"
                className="u-float-right u-no-margin--bottom"
                onClick={() =>
                  navigate(`/ui/project/${project}/instances/create`)
                }
              >
                {createButtonLabel}
              </Button>
            </div>
          )}
        </div>
        <div className="p-panel__content instance-content">
          <NotificationRow />
          <Row className="no-grid-gap">
            <Col size={12}>
              {hasInstances && (
                <>
                  <TableColumnsSelect
                    columns={[TYPE, DESCRIPTION, IPV4, IPV6, SNAPSHOTS]}
                    hidden={userHidden}
                    setHidden={setHidden}
                    className={classnames({
                      "u-hide": panelParams.instance,
                    })}
                  />
                  <ScrollableTable
                    belowId="pagination"
                    dependencies={[filteredInstances, notify.notification]}
                  >
                    <SelectableMainTable
                      headers={getHeaders(userHidden.concat(sizeHidden))}
                      rows={pagination.pageData}
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
                      processingNames={processingNames}
                      totalCount={instances.length}
                      filteredNames={filteredInstances.map(
                        (instance) => instance.name
                      )}
                      onUpdateSort={pagination.updateSort}
                    />
                  </ScrollableTable>
                  <Pagination
                    {...pagination}
                    id="pagination"
                    totalCount={instances.length + creationOperations.length}
                    visibleCount={
                      filteredInstances.length === instances.length
                        ? pagination.pageData.length
                        : filteredInstances.length
                    }
                    keyword="instance"
                  />
                  <div id="instance-table-measure">
                    <SelectableMainTable
                      headers={getHeaders(userHidden)}
                      rows={getRows(userHidden)}
                      className="scrollable-table"
                      itemName="instance"
                      parentName="project"
                      selectedNames={selectedNames}
                      setSelectedNames={setSelectedNames}
                      processingNames={processingNames}
                      totalCount={instances.length}
                      filteredNames={filteredInstances.map(
                        (instance) => instance.name
                      )}
                    />
                  </div>
                </>
              )}
              {!hasInstances && (
                <EmptyState
                  className="empty-state"
                  image={
                    <Icon name="containers" className="empty-state-icon" />
                  }
                  title="No instances found"
                >
                  <p>
                    There are no instances in this project. Spin up your first
                    instance!
                  </p>
                  <p>
                    <a
                      href="https://documentation.ubuntu.com/lxd/en/latest/howto/instances_create/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      How to create instances
                      <Icon
                        className="external-link-icon"
                        name="external-link"
                      />
                    </a>
                  </p>
                  <Button
                    className="empty-state-button"
                    appearance="positive"
                    onClick={() =>
                      navigate(`/ui/project/${project}/instances/create`)
                    }
                  >
                    Create instance
                  </Button>
                </EmptyState>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

export default InstanceList;
