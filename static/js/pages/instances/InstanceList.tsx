import {
  Button,
  Col,
  List,
  MainTable,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import React, { FC, useEffect, useState } from "react";
import { fetchInstances } from "api/instances";
import NotificationRow from "components/NotificationRow";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import usePanelParams from "util/usePanelParams";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "components/Loader";
import { instanceStatuses, instanceListTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import TableColumnsSelect from "components/TableColumnsSelect";
import useEventListener from "@use-it/event-listener";
import EmptyState from "components/EmptyState";
import { LxdInstance } from "types/instance";
import classnames from "classnames";

const STATUS = "Status";
const NAME = "Name";
const TYPE = "Type";
const DESCRIPTION = "Description";
const IPV4 = "IPv4";
const IPV6 = "IPv6";
const SNAPSHOTS = "Snapshots";

const PAGE_SIZE = 15;

const loadHidden = () => {
  const saved = localStorage.getItem("instanceListHiddenColumns");
  return saved ? (JSON.parse(saved) as string[]) : [];
};

const saveHidden = (columns: string[]) => {
  localStorage.setItem("instanceListHiddenColumns", JSON.stringify(columns));
};

const InstanceList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("any");
  const [type, setType] = useState<string>("any");
  const [starting, setStarting] = useState<string[]>([]);
  const [stopping, setStopping] = useState<string[]>([]);
  const [userHidden, setUserHidden] = useState<string[]>(loadHidden());
  const [sizeHidden, setSizeHidden] = useState<string[]>([]);

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: instances = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances],
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

  const updateTBodyHeight = () => {
    const table = document.getElementById("instance-table-wrapper");
    if (!table || table.children.length !== 2) {
      return;
    }
    const tBody = table.children[1];
    const above = tBody.getBoundingClientRect().top + 1;
    const below = instances.length > PAGE_SIZE ? 81 : 0;
    const offset = Math.ceil(above + below);
    const style = `height: calc(100vh - ${offset}px)`;
    tBody.setAttribute("style", style);
  };
  useEffect(() => {
    updateTBodyHeight();
  }, [instances, notify.notification, query, status, type]);

  const setHidden = (columns: string[]) => {
    setUserHidden(columns);
    saveHidden(columns);
  };

  const addStarting = (instance: LxdInstance) => {
    setStarting((prev) => prev.concat(instance.name));
  };

  const addStopping = (instance: LxdInstance) => {
    setStopping((prev) => prev.concat(instance.name));
  };

  const removeLoading = (instance: LxdInstance) => {
    setStarting((prev) => prev.filter((name) => name !== instance.name));
    setStopping((prev) => prev.filter((name) => name !== instance.name));
  };

  const visibleInstances = instances.filter((item) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.status.toLowerCase().includes(q) &&
        !item.type.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.config["image.description"].toLowerCase().includes(q)
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
      { content: null, className: "actions" },
    ].filter(
      (item) =>
        typeof item.content !== "string" || !hiddenCols.includes(item.content)
    );

  const getRows = (hiddenCols: string[]) =>
    visibleInstances.map((instance) => {
      const openSummary = () =>
        panelParams.openInstanceSummary(instance.name, project);

      return {
        className:
          panelParams.instance === instance.name ? "u-row-selected" : "u-row",
        columns: [
          {
            content: (
              <Link to={`/ui/${instance.project}/instances/${instance.name}`}>
                {instance.name}
              </Link>
            ),
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
            content: instance.description,
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
            content: (
              <InstanceStatusIcon
                instance={instance}
                isStarting={starting.includes(instance.name)}
                isStopping={stopping.includes(instance.name)}
              />
            ),
            role: "rowheader",
            className: "clickable-cell status",
            "aria-label": STATUS,
            onClick: openSummary,
          },
          {
            content: (
              <List
                inline
                className="u-no-margin--bottom"
                items={[
                  <StartStopInstanceBtn
                    key="startstop"
                    className={classnames("u-instance-actions", {
                      "u-hide": starting
                        .concat(stopping)
                        .includes(instance.name),
                    })}
                    instance={instance}
                    hasCaption={true}
                    onStarting={addStarting}
                    onStopping={addStopping}
                    onFinish={removeLoading}
                  />,
                ]}
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
              <h4>
                {visibleInstances.length}
                &nbsp;
                {visibleInstances.length === 1 ? "Instance" : "Instances"}
              </h4>
              <SearchBox
                className="search-box margin-right"
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
              onClick={() => navigate(`/ui/${project}/instances/create-new`)}
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
                      rows={getRows(userHidden.concat(sizeHidden))}
                      sortable
                      paginate={PAGE_SIZE}
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
                      navigate(`/ui/${project}/instances/create-new`)
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
