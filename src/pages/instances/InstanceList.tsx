import {
  Button,
  Col,
  MainTable,
  Row,
  SearchBox,
  Select,
  usePagination,
} from "@canonical/react-components";
import React, { FC, useEffect, useState } from "react";
import { fetchInstances } from "api/instances";
import NotificationRow from "components/NotificationRow";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import usePanelParams from "util/usePanelParams";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "components/Loader";
import { instanceStatuses, instanceListTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import TableColumnsSelect from "components/TableColumnsSelect";
import useEventListener from "@use-it/event-listener";
import EmptyState from "components/EmptyState";
import classnames from "classnames";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import Pagination from "components/Pagination";
import { paginationOptions } from "util/paginationOptions";
import { updateTBodyHeight } from "util/updateTBodyHeight";

const STATUS = "Status";
const NAME = "Name";
const TYPE = "Type";
const DESCRIPTION = "Description";
const IPV4 = "IPv4";
const IPV6 = "IPv6";
const SNAPSHOTS = "Snapshots";

const loadHidden = () => {
  const saved = localStorage.getItem("instanceListHiddenColumns");
  return saved ? (JSON.parse(saved) as string[]) : [];
};

const saveHidden = (columns: string[]) => {
  localStorage.setItem("instanceListHiddenColumns", JSON.stringify(columns));
};

const InstanceList: FC = () => {
  const instanceLoading = useInstanceLoading();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("any");
  const [type, setType] = useState<string>("any");
  const [userHidden, setUserHidden] = useState<string[]>(loadHidden());
  const [sizeHidden, setSizeHidden] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(paginationOptions[0].value);

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
    notify.failure("Could not load instances.", error);
  }

  const figureSizeHidden = () => {
    const wrapper = document.getElementById("instance-table-measure");
    const table = wrapper?.children[0];
    const columns = table?.firstChild?.firstChild;

    if (!wrapper || !table || !columns) {
      return;
    }

    const wrapWidth = wrapper.getBoundingClientRect().width;
    const tableWidth = table.getBoundingClientRect().width;
    const colWidth = new Map();
    columns.childNodes.forEach((item) => {
      const col = item as Element;
      const name = col.innerHTML;
      const width = col.getBoundingClientRect().width;
      colWidth.set(name, width);
    });

    let gainedSpace = 0;
    const sizeHiddenNew: string[] = [];
    [SNAPSHOTS, IPV6, IPV4, DESCRIPTION, TYPE].forEach((column) => {
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
  useEffect(figureSizeHidden, [panelParams.instance, userHidden, instances]);

  const setHidden = (columns: string[]) => {
    setUserHidden(columns);
    saveHidden(columns);
  };

  const filteredInstances = instances.filter((item) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.status.toLowerCase().includes(q) &&
        !item.type.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.config["image.description"]?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (type !== "any" && item.type !== type) {
      return false;
    }
    if (status !== "any" && item.status !== status) {
      return false;
    }
    return true;
  });

  const getHeaders = (hiddenCols: string[]) =>
    [
      { content: NAME, sortKey: "name", className: "name" },
      { content: TYPE, sortKey: "type", className: "type" },
      {
        content: DESCRIPTION,
        sortKey: "description",
        className: "description",
      },
      { content: IPV4, className: "u-align--right ipv4" },
      { content: IPV6, id: "header-ipv6", className: "ipv6" },
      {
        content: SNAPSHOTS,
        sortKey: "snapshots",
        className: "u-align--right snapshots",
      },
      { content: STATUS, sortKey: "status", className: "status-header status" },
      {
        "aria-label": "Actions",
        className: "actions",
      },
    ].filter(
      (item) =>
        typeof item.content !== "string" || !hiddenCols.includes(item.content)
    );

  const getRows = (hiddenCols: string[]) =>
    filteredInstances.map((instance) => {
      const openSummary = () =>
        panelParams.openInstanceSummary(instance.name, project);

      return {
        className:
          panelParams.instance === instance.name ? "u-row-selected" : "u-row",
        columns: [
          {
            content: <InstanceLink instance={instance} />,
            role: "rowheader",
            className: "name",
            "aria-label": NAME,
          },
          {
            content: instance.type,
            role: "rowheader",
            "aria-label": TYPE,
            onClick: openSummary,
            className: "clickable-cell type",
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
            className: "clickable-cell description",
          },
          {
            content: instance.state?.network?.eth0?.addresses
              .filter(
                (item) =>
                  item.family === "inet" && !item.address.startsWith("127")
              )
              .map((item) => item.address)
              .join(" "),
            role: "rowheader",
            className: "u-align--right clickable-cell ipv4",
            "aria-label": IPV4,
            onClick: openSummary,
          },
          {
            content: instance.state?.network?.eth0?.addresses
              .filter(
                (item) =>
                  item.family === "inet6" && !item.address.startsWith("fe80")
              )
              .map((item) => item.address)
              .join(" "),
            role: "rowheader",
            "aria-label": IPV6,
            onClick: openSummary,
            className: "clickable-cell ipv6",
          },
          {
            content: instance.snapshots?.length ?? "0",
            role: "rowheader",
            className: "u-align--right clickable-cell, snapshots",
            "aria-label": SNAPSHOTS,
            onClick: openSummary,
          },
          {
            content: <InstanceStatusIcon instance={instance} />,
            role: "rowheader",
            className: "clickable-cell status",
            "aria-label": STATUS,
            onClick: openSummary,
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
            className: "u-align--right actions",
            "aria-label": "Details",
          },
        ].filter((item) => !hiddenCols.includes(item["aria-label"])),
        sortData: {
          name: instance.name,
          status: instance.status,
          type: instance.type,
          snapshots: instance.snapshots?.length ?? 0,
        },
      };
    });

  const {
    pageData: pageInstances,
    currentPage,
    paginate: setCurrentPage,
  } = usePagination(getRows(userHidden.concat(sizeHidden)), {
    itemsPerPage: pageSize,
    autoResetPage: true,
  });

  useEventListener("resize", () => updateTBodyHeight("instance-table-wrapper"));
  useEffect(() => {
    updateTBodyHeight("instance-table-wrapper");
  }, [
    instances,
    notify.notification,
    query,
    status,
    type,
    pageSize,
    currentPage,
  ]);

  return (
    <>
      <main className="l-main instance-list">
        <div
          className={classnames("p-panel", {
            "has-side-panel": !!panelParams.instance,
          })}
        >
          <div className="p-panel__header instance-list-header">
            <div className="instance-header-left">
              <h1 className="p-heading--4">
                {instances.length}
                &nbsp;
                {instances.length === 1 ? "Instance" : "Instances"}
              </h1>
              <SearchBox
                className="search-box margin-right"
                name="search-instance"
                type="text"
                onChange={(value) => {
                  setQuery(value);
                }}
                placeholder="Search"
                value={query}
                aria-label="Search"
              />
              <Select
                wrapperClassName="margin-right filter-state"
                onChange={(v) => {
                  setStatus(v.target.value);
                }}
                options={[
                  {
                    label: "All statuses",
                    value: "any",
                  },
                  ...instanceStatuses,
                ]}
                value={status}
                aria-label="Filter status"
              />
              <Select
                wrapperClassName="margin-right filter-type"
                onChange={(v) => {
                  setType(v.target.value);
                }}
                options={[
                  {
                    label: "Containers and VMs",
                    value: "any",
                  },
                  ...instanceListTypes,
                ]}
                value={type}
                aria-label="Filter type"
              />
            </div>
            <Button
              appearance="positive"
              onClick={() => navigate(`/ui/${project}/instances/create`)}
            >
              Create new
            </Button>
          </div>
          <div className="p-panel__content instance-content">
            <NotificationRow />
            <Row className="no-grid-gap">
              <Col size={12}>
                <TableColumnsSelect
                  columns={[TYPE, DESCRIPTION, IPV4, IPV6, SNAPSHOTS]}
                  hidden={userHidden}
                  setHidden={setHidden}
                  className={
                    panelParams.instance || instances.length < 1
                      ? "u-hide"
                      : undefined
                  }
                />
                {isLoading || instances.length > 0 ? (
                  <>
                    <MainTable
                      headers={getHeaders(userHidden.concat(sizeHidden))}
                      rows={pageInstances}
                      sortable
                      className="instance-table"
                      id="instance-table-wrapper"
                      emptyStateMsg={
                        isLoading ? (
                          <Loader text="Loading instances..." />
                        ) : (
                          <>No instance found matching this search</>
                        )
                      }
                    />
                    <Pagination
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      pageSize={pageSize}
                      setPageSize={setPageSize}
                      totalCount={instances.length}
                      totalPages={Math.ceil(
                        filteredInstances.length / pageSize
                      )}
                      visibleCount={
                        filteredInstances.length === instances.length
                          ? pageInstances.length
                          : filteredInstances.length
                      }
                      keyword="instance"
                    />
                    <div id="instance-table-measure">
                      <MainTable
                        headers={getHeaders(userHidden)}
                        rows={getRows(userHidden)}
                        className="instance-table u-table-layout--auto"
                      />
                    </div>
                  </>
                ) : (
                  <EmptyState
                    iconName="containers"
                    iconClass="p-empty-instances"
                    title="No instances found"
                    message="There are no instances in this project. Spin up your first instance!"
                    linkMessage="How to create instances"
                    linkURL="https://linuxcontainers.org/lxd/docs/latest/howto/instances_create/"
                    buttonLabel="Create"
                    buttonAction={() =>
                      navigate(`/ui/${project}/instances/create`)
                    }
                  />
                )}
              </Col>
            </Row>
          </div>
        </div>
      </main>
    </>
  );
};

export default InstanceList;
