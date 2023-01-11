import {
  Button,
  Col,
  ContextualMenu,
  Icon,
  MainTable,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import React, { FC, useState } from "react";
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

const InstanceList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const panelParams = usePanelParams();
  const [params, setParams] = useSearchParams();
  const selected = params.get("selected");
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("any");
  const [type, setType] = useState<string>("any");

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

  // todo: which states are used - can error/unknown/init be removed?
  const getIconClassForStatus = (status: string) => {
    return {
      error: "p-icon--oval-red",
      unknown: "p-icon--oval-yellow",
      initializing: "p-icon--spinner u-animation--spin",
      Running: "p-icon--oval-green",
      Stopped: "p-icon--oval-grey",
    }[status];
  };

  const rows = visibleInstances.map((instance) => {
    const status = (
      <>
        <i className={getIconClassForStatus(instance.status)}></i>
        &nbsp;
        {instance.status}
      </>
    );

    return {
      className: selected === instance.name ? "u-row-selected" : undefined,
      columns: [
        {
          content: status,
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
            <Button
              className="u-no-margin--bottom"
              onClick={() => setSelected(instance.name)}
              hasIcon
            >
              <Icon name="chevron-up" style={{ rotate: "90deg" }} />
            </Button>
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
          <ContextualMenu
            hasToggleIcon
            links={[
              {
                children: "Quick create instance",
                onClick: () => panelParams.openInstanceFormGuided(),
              },
              {
                children: "Custom create instance (YAML)",
                onClick: () => panelParams.openInstanceFormYaml(),
              },
            ]}
            position="right"
            toggleAppearance="positive"
            toggleClassName="u-no-margin--bottom"
            toggleLabel="Add instance"
          />
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
                  "No data to display"
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
