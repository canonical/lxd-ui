import {
  Button,
  Col,
  Icon,
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
import useNotification from "util/useNotification";
import usePanelParams from "util/usePanelParams";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Loader from "components/Loader";
import { instanceStatuses, instanceListTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import { useSharedNotify } from "../../context/sharedNotify";
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

const loadHidden = () => {
  const saved = localStorage.getItem("instanceListHiddenColumns");
  return saved ? (JSON.parse(saved) as string[]) : [];
};

const saveHidden = (columns: string[]) => {
  localStorage.setItem("instanceListHiddenColumns", JSON.stringify(columns));
};

const InstanceList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const panelParams = usePanelParams();
  const { project } = useParams<{
    project: string;
  }>();
  const [params, setParams] = useSearchParams();
  const selected = params.get("selected");
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("any");
  const [type, setType] = useState<string>("any");
  const [starting, setStarting] = useState<string[]>([]);
  const [stopping, setStopping] = useState<string[]>([]);
  const [userHidden, setUserHidden] = useState<string[]>(loadHidden());
  const [sizeHidden, setSizeHidden] = useState<string[]>([]);

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
  useEffect(figureSizeHidden, [selected, userHidden]);
  figureSizeHidden();

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

  if (!project) {
    return <>Missing project</>;
  }

  const { setSharedNotify } = useSharedNotify();
  useEffect(() => {
    if (setSharedNotify) {
      setSharedNotify(notify);
    }
  }, [setSharedNotify, notify]);

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

  const setSelected = (name?: string) => {
    const newParams = new URLSearchParams();
    if (name) {
      newParams.set("selected", name);
    }
    setParams(newParams);
  };

  const detailInstance = instances.find((item) => item.name === selected);
  const visibleInstances = instances.filter((item) => {
    if (query && !item.name.includes(query)) {
      return false;
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
      { content: NAME, sortKey: "name" },
      { content: TYPE, sortKey: "type" },
      { content: DESCRIPTION, sortKey: "description" },
      { content: IPV4, className: "u-align--right" },
      { content: IPV6, id: "header-ipv6" },
      {
        content: SNAPSHOTS,
        sortKey: "snapshots",
        className: "u-align--right",
      },
      { content: STATUS, sortKey: "status" },
      { content: null },
    ].filter(
      (item) =>
        typeof item.content !== "string" || !hiddenCols.includes(item.content)
    );

  const getRows = (hiddenCols: string[]) =>
    visibleInstances.map((instance) => {
      return {
        className: selected === instance.name ? "u-row-selected" : "u-row",
        columns: [
          {
            content: (
              <Link to={`/ui/${instance.project}/instances/${instance.name}`}>
                {instance.name}
              </Link>
            ),
            role: "rowheader",
            "aria-label": NAME,
          },
          {
            content: instance.type,
            role: "rowheader",
            "aria-label": TYPE,
          },
          {
            content: instance.description,
            role: "rowheader",
            "aria-label": DESCRIPTION,
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
            className: "u-align--right",
            "aria-label": IPV4,
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
          },
          {
            content: (
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                onClick={() =>
                  navigate(
                    `/ui/${instance.project}/instances/${instance.name}/snapshots`
                  )
                }
              >
                {instance.snapshots?.length ?? "0"}
              </Button>
            ),
            role: "rowheader",
            className: "u-align--right",
            "aria-label": SNAPSHOTS,
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
            className: "u-truncate",
            "aria-label": STATUS,
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
                    notify={notify}
                    hasCaption={true}
                    onStarting={addStarting}
                    onStopping={addStopping}
                    onFinish={removeLoading}
                  />,
                  <Button
                    key="select"
                    appearance="base"
                    className="u-no-margin--bottom u-hide--medium u-hide--small"
                    onClick={() => {
                      setSelected(instance.name);
                      panelParams.openInstanceSummary(instance.name, project);
                    }}
                    hasIcon
                  >
                    <Icon name="chevron-up" style={{ rotate: "90deg" }} />
                  </Button>,
                ]}
              />
            ),
            role: "rowheader",
            className: "u-align--right",
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
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <Row className="p-panel__title p-instance-header no-grid-gap">
            <Col size={3}>
              <h4 className="margin-bottom">
                {visibleInstances.length}{" "}
                {visibleInstances.length === 1 ? "Instance" : "Instances"}
              </h4>
            </Col>
            <Col size={7} className="middle-column">
              <SearchBox
                className="search-box margin-right margin-bottom"
                id="filter-query"
                type="text"
                onChange={(value) => {
                  setQuery(value);
                }}
                placeholder="Search"
                value={query}
              />
              <Select
                className="margin-bottom"
                wrapperClassName="margin-right"
                id="filter-state"
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
              />
              <Select
                className="margin-bottom"
                id="filter-type"
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
              />
            </Col>
            <Col size={2}>
              <Button
                className="margin-bottom u-float-right"
                appearance="positive"
                onClick={() => panelParams.openCreateInstance(project)}
              >
                Create new
              </Button>
            </Col>
            <hr className="u-no-margin--bottom" />
          </Row>
        </div>
        <div className="p-panel__content p-instance-content">
          <NotificationRow notify={notify} />
          <Row className="no-grid-gap">
            <Col size={12}>
              <TableColumnsSelect
                columns={[TYPE, DESCRIPTION, IPV4, IPV6, SNAPSHOTS]}
                hidden={userHidden}
                setHidden={setHidden}
                className={
                  detailInstance || instances.length < 1 ? "u-hide" : undefined
                }
              />
              {isLoading || instances.length > 0 ? (
                <>
                  <MainTable
                    headers={getHeaders(userHidden.concat(sizeHidden))}
                    rows={getRows(userHidden.concat(sizeHidden))}
                    paginate={15}
                    sortable
                    className="instance-table u-table-layout--auto"
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
                  buttonAction={() => panelParams.openCreateInstance(project)}
                />
              )}
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

export default InstanceList;
