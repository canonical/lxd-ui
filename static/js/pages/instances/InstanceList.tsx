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
import InstanceDetailPanel from "./InstanceDetailPanel";
import Loader from "components/Loader";
import { instanceStatuses, instanceListTypes } from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import { useSharedNotify } from "../../context/sharedNotify";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenVgaBtn from "./actions/OpenVgaBtn";

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

  const headers = [
    { content: "Status", sortKey: "status", className: "u-align--center" },
    { content: "Name", sortKey: "name" },
    { content: "Type", sortKey: "type", className: "u-align--center" },
    { content: "IPv4" },
    { content: "IPv6" },
    {
      content: "Snapshots",
      sortKey: "snapshots",
      className: "u-align--center",
    },
    { content: "" },
  ];

  const rows = visibleInstances.map((instance) => {
    return {
      className: selected === instance.name ? "u-row-selected" : "u-row",
      columns: [
        {
          content: <InstanceStatusIcon instance={instance} />,
          role: "rowheader",
          className: "u-truncate",
          "aria-label": "Status",
        },
        {
          content: (
            <Link to={`/ui/${instance.project}/instances/${instance.name}`}>
              {instance.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: instance.type,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Type",
        },
        {
          content: instance.state?.network?.eth0?.addresses
            .filter((item) => item.family === "inet")
            .map((item) => item.address)
            .filter((address) => !address.startsWith("127"))
            .join(" "),
          role: "rowheader",
          "aria-label": "IPv4",
        },
        {
          content: instance.state?.network?.eth0?.addresses
            .filter((item) => item.family === "inet6")
            .map((item) => item.address)
            .filter((address) => !address.startsWith("fe80"))
            .join(" "),
          role: "rowheader",
          "aria-label": "IPv6",
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
          className: "u-align--center",
          "aria-label": "Snapshots",
        },
        {
          content: (
            <List
              inline
              className="u-no-margin--bottom"
              items={[
                <StartStopInstanceBtn
                  key="startstop"
                  className="u-instance-actions"
                  instance={instance}
                  notify={notify}
                  hasCaption={false}
                />,
                <OpenVgaBtn
                  key="vga"
                  className="u-instance-actions"
                  instance={instance}
                />,
                <OpenTerminalBtn
                  key="terminal"
                  className="u-instance-actions"
                  instance={instance}
                />,
                <Button
                  key="select"
                  appearance="base"
                  className="u-no-margin--bottom u-hide--medium u-hide--small"
                  onClick={() => setSelected(instance.name)}
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
      ],
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
            <hr />
          </Row>
        </div>
        <div className="p-panel__content p-instance-content">
          <NotificationRow notify={notify} />
          <Row>
            <Col size={detailInstance ? 8 : 12}>
              <MainTable
                headers={headers}
                rows={rows}
                paginate={15}
                sortable
                className={`p-instance-table ${
                  selected ? "p-instance-table-with-panel" : ""
                } u-table-layout--auto`}
                emptyStateMsg={
                  isLoading ? (
                    <Loader text="Loading instances..." />
                  ) : (
                    <Row className="p-strip empty-state-message">
                      <Col size={4} className="u-align--right">
                        <Icon
                          name="containers"
                          className="u-hide--small icon"
                        />
                      </Col>
                      <Col size={8} className="u-align--left">
                        <h4 className="p-heading--2">No instances found</h4>
                        <p>
                          Looks like there are no instances in this project!
                          Create a new instance with the &quot;Add
                          instance&quot; button above.
                        </p>
                        <p>
                          <a
                            className="p-link--external"
                            href="https://linuxcontainers.org/lxd/docs/latest/instances/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Read the documentation on instances
                          </a>
                        </p>
                      </Col>
                    </Row>
                  )
                }
              />
            </Col>
            {detailInstance && (
              <Col size={4} className="u-hide--medium u-hide--small">
                <InstanceDetailPanel
                  instance={detailInstance}
                  notify={notify}
                  onClose={() => setSelected()}
                />
              </Col>
            )}
          </Row>
        </div>
      </div>
    </main>
  );
};

export default InstanceList;
