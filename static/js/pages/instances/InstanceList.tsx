import {
  Button,
  Col,
  Icon,
  MainTable,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import React, { FC, useEffect, useState } from "react";
import { fetchInstances } from "api/instances";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import useNotification from "util/useNotification";
import usePanelParams from "util/usePanelParams";
import { useNavigate, useSearchParams } from "react-router-dom";
import InstanceDetailPanel from "./InstanceDetailPanel";
import Loader from "components/Loader";
import {
  instanceStatusOptions,
  instanceTypeOptions,
} from "util/instanceOptions";
import InstanceStatusIcon from "./InstanceStatusIcon";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import { useSharedNotify } from "../../context/sharedNotify";

const InstanceList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const panelParams = usePanelParams();
  const [params, setParams] = useSearchParams();
  const selected = params.get("selected");
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("any");
  const [type, setType] = useState<string>("any");

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
    queryFn: fetchInstances,
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
    { content: "", className: "u-hide--medium u-hide--small" },
  ];

  const rows = visibleInstances.map((instance) => {
    return {
      className: selected === instance.name ? "u-row-selected" : undefined,
      columns: [
        {
          content: <InstanceStatusIcon instance={instance} />,
          role: "rowheader",
          className: "u-truncate",
          "aria-label": "Status",
        },
        {
          content: (
            <a href={`/ui/instances/${instance.name}`}>{instance.name}</a>
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
            .join(" "),
          role: "rowheader",
          "aria-label": "IPv4",
        },
        {
          content: instance.state?.network?.eth0?.addresses
            .filter((item) => item.family === "inet6")
            .map((item) => item.address)
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
                navigate(`/ui/instances/${instance.name}/snapshots`)
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
            <>
              <StartStopInstanceBtn
                instance={instance}
                notify={notify}
                hasCaption={false}
                isDense={false}
              />
              <Button
                className="u-no-margin--bottom"
                onClick={() => setSelected(instance.name)}
                hasIcon
              >
                <Icon name="chevron-up" style={{ rotate: "90deg" }} />
              </Button>
            </>
          ),
          role: "rowheader",
          className: "u-align--center u-hide--medium u-hide--small",
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
    <>
      <BaseLayout
        title={
          <>
            Instances{" "}
            <small className="u-ma">
              {visibleInstances.length}{" "}
              {visibleInstances.length === 1 ? "instance" : "instances"}{" "}
              available
            </small>
          </>
        }
        controls={
          <Button
            className="u-no-margin--bottom"
            appearance="positive"
            onClick={() => panelParams.openInstanceFormGuided()}
          >
            Add instance
          </Button>
        }
      >
        <NotificationRow notify={notify} />
        <Row>
          <Col size={4}>
            <SearchBox
              id="filter-query"
              type="text"
              onChange={(value) => {
                setQuery(value);
              }}
              placeholder="Search for instances"
              value={query}
            />
          </Col>
          <Col size={2}>
            <Select
              id="filter-state"
              onChange={(v) => {
                setStatus(v.target.value);
              }}
              options={[
                {
                  label: "All states",
                  value: "any",
                },
                ...instanceStatusOptions,
              ]}
              value={status}
            />
          </Col>
          <Col size={2}>
            <Select
              id="filter-type"
              onChange={(v) => {
                setType(v.target.value);
              }}
              options={[
                {
                  label: "All types",
                  value: "any",
                },
                ...instanceTypeOptions,
              ]}
              value={type}
            />
          </Col>
        </Row>
        <Row>
          <Col size={detailInstance ? 8 : 12}>
            <MainTable
              headers={headers}
              rows={rows}
              paginate={15}
              sortable
              className="p-instance-table u-table-layout--auto"
              emptyStateMsg={
                isLoading ? (
                  <Loader text="Loading instances..." />
                ) : (
                  <Row className="p-strip empty-state-message">
                    <Col size={4} className="u-align--right">
                      <Icon name="containers" className="u-hide--small icon" />
                    </Col>
                    <Col size={8} className="u-align--left">
                      <h4 className="p-heading--2">No instances found</h4>
                      <p>
                        Looks like there are no instances in this project!
                        Create a new instance with the &quot;Add instance&quot;
                        button above.
                      </p>
                      <p>
                        <a
                          className="p-link--external"
                          href="https://linuxcontainers.org/lxd/docs/latest/instances/"
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
      </BaseLayout>
    </>
  );
};

export default InstanceList;
