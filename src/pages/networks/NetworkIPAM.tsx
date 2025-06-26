import type { FC } from "react";
import { useEffect } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import PageHeader from "components/PageHeader";
import CustomLayout from "components/CustomLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworkAllocations } from "api/networks";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import UsedByItem from "components/UsedByItem";

const NetworkIPAM: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  const {
    data: allocations = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networkAllocations],
    queryFn: async () => fetchNetworkAllocations(project ?? "default"),
  });

  useEffect(() => {
    if (error) {
      notify.failure("Loading network allocations failed", error);
    }
  }, [error]);

  if (!project) {
    return <>Missing project</>;
  }

  const headers = [
    { content: "Type", sortKey: "type", className: "type" },
    { content: "Used by", sortKey: "usedBy", className: "usedBy" },
    { content: "Address", sortKey: "address", className: "address" },
    { content: "NAT", sortKey: "nat", className: "nat" },
    { content: "Hardware Address", sortKey: "hwaddress", className: "hwaddr" },
  ];

  const rows = allocations.map((allocation) => {
    const usedByItems = filterUsedByType(allocation.type, [allocation.used_by]);

    const getUsedByUrl = (item: LxdUsedBy) => {
      if (allocation.type === "instance") {
        return `/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.name)}`;
      }
      if (allocation.type === "network") {
        return `/ui/project/${encodeURIComponent(item.project)}/network/${encodeURIComponent(item.name)}`;
      }
      if (allocation.type === "network-forward") {
        return `/ui/project/${encodeURIComponent(item.project)}/network/${encodeURIComponent(item.name)}/forward`;
      }

      return "";
    };

    return {
      columns: [
        {
          content: allocation.type,
          role: "cell",
          className: "type",
        },
        {
          content: (
            <>
              {usedByItems.length === 1 ? (
                <UsedByItem
                  item={usedByItems[0]}
                  activeProject={project}
                  type={allocation.type}
                  to={getUsedByUrl(usedByItems[0])}
                />
              ) : (
                allocation.used_by
              )}
            </>
          ),
          role: "rowheader",
          className: "usedBy",
        },
        {
          content: allocation.addresses,
          role: "cell",
          className: "address",
        },
        {
          content: allocation.nat ? "Yes" : "No",
          role: "cell",
          className: "nat",
        },
        {
          content: allocation.hwaddr,
          role: "cell",
          className: "hwaddr",
        },
      ],
      sortData: {
        usedBy: allocation.used_by.toLowerCase(),
        address: allocation.addresses,
        type: allocation.type,
        nat: allocation.nat,
        hwaddress: allocation.hwaddr,
      },
    };
  });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/howto/network_ipam/`}
                title="Learn more about IPAM"
              >
                IP Address Management
              </HelpLink>
            </PageHeader.Title>
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {allocations.length > 0 && (
          <MainTable
            className="network-ipam-table"
            headers={headers}
            rows={rows}
            responsive
            sortable
            emptyStateMsg="No data to display"
          />
        )}
        {!isLoading && allocations.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="No network allocations found"
          >
            <p>There are no network allocations in this project.</p>
            <p>
              <a
                href={`${docBaseLink}/howto/network_ipam/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about network allocations
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkIPAM;
