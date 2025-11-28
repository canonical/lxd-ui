import type { FC } from "react";
import { useEffect } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import PageHeader from "components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworkAllocations } from "api/networks";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import UsedByItem from "components/UsedByItem";
import ResourceLink from "components/ResourceLink";
import DocLink from "components/DocLink";
import { InstanceIpEdit } from "components/InstanceIpEdit";
import { typesWithNicStaticIPSupport } from "util/networks";
import { useNetworks } from "context/useNetworks";
import type { LxdNetworkAllocation } from "types/network";

const NetworkIPAM: FC = () => {
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

  const { data: networks } = useNetworks(project ?? "");

  const getNetworkTypeFromAllocation = (allocation: LxdNetworkAllocation) => {
    return networks?.find((n) => n.name === allocation.network)?.type;
  };

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
    { content: "Network", sortKey: "network", className: "network" },
    { content: "NAT", sortKey: "nat", className: "nat" },
    { content: "MAC address", sortKey: "hwaddress", className: "hwaddr" },
    { content: "Address", sortKey: "address", className: "address" },
  ];

  const rows = allocations.map((allocation) => {
    const usedByItemArray = filterUsedByType(allocation.type, [
      allocation.used_by,
    ]);
    const usedByItem = usedByItemArray.length === 1 ? usedByItemArray[0] : null;

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
          content: usedByItem && (
            <UsedByItem
              item={usedByItem}
              activeProject={project}
              type={allocation.type}
              to={getUsedByUrl(usedByItem)}
            />
          ),
          role: "rowheader",
          className: "usedBy",
        },
        {
          content: (
            <ResourceLink
              type="network"
              value={allocation.network}
              to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(allocation.network)}`}
            />
          ),
          role: "cell",
          className: "network",
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
        {
          content:
            allocation.type === "instance" &&
            usedByItem &&
            typesWithNicStaticIPSupport.includes(
              getNetworkTypeFromAllocation(allocation) ?? "",
            ) ? (
              <InstanceIpEdit
                address={allocation.addresses}
                instanceName={usedByItem.name}
                projectName={usedByItem.project}
              />
            ) : (
              <>{allocation.addresses}</>
            ),
          role: "cell",
          className: "address",
        },
      ],
      sortData: {
        usedBy: allocation.used_by.toLowerCase(),
        type: allocation.type,
        nat: allocation.nat,
        hwaddress: allocation.hwaddr,
        network: allocation.network?.toLowerCase(),
        address: allocation.addresses,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/howto/network_ipam/"
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
          <ScrollableTable
            dependencies={allocations}
            tableId="network-ipam-table"
            belowIds={["status-bar"]}
          >
            <MainTable
              className="network-ipam-table"
              id="network-ipam-table"
              headers={headers}
              rows={rows}
              defaultSort="address"
              defaultSortDirection="ascending"
              responsive
              sortable
              emptyStateMsg="No data to display"
            />
          </ScrollableTable>
        )}
        {!isLoading && allocations.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="No network allocations found"
          >
            <p>There are no network allocations in this project.</p>
            <p>
              <DocLink docPath="/howto/network_ipam/" hasExternalIcon>
                Learn more about network allocations
              </DocLink>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkIPAM;
