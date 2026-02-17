import type { FC } from "react";
import { Fragment, useEffect } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import NetworkForwardCount from "pages/networks/NetworkForwardCount";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import {
  isNetwork,
  notifyNetworkError,
  renderNetworkType,
} from "util/networks";
import { useClusterMembers } from "context/useClusterMembers";
import PageHeader from "components/PageHeader";
import type { NetworkFilters } from "pages/networks/NetworkSearchFilter";
import NetworkSearchFilter, {
  MANAGED,
  MEMBER,
  STATE,
  TYPE,
  QUERY,
} from "pages/networks/NetworkSearchFilter";
import type { LXDNetworkOnClusterMemberFulfilled } from "types/network";
import NetworkClusterMemberChip from "pages/networks/NetworkClusterMemberChip";
import {
  useNetworks,
  useNetworksFromClusterMembers,
} from "context/useNetworks";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import DocLink from "components/DocLink";
import { ROOT_PATH } from "util/rootPath";

const NetworkList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const isSmallScreen = useIsScreenBelow();
  const { data: clusterMembers = [] } = useClusterMembers();
  const isClustered = clusterMembers.length > 0;
  const [searchParams] = useSearchParams();
  const { canCreateNetworks } = useProjectEntitlements();
  const { project: currentProject } = useCurrentProject();

  const filters: NetworkFilters = {
    queries: searchParams.getAll(QUERY),
    type: searchParams.getAll(TYPE).map((value) => value.toLowerCase()),
    managed: searchParams.getAll(MANAGED).map((value) => value.toLowerCase()),
    member: searchParams.getAll(MEMBER),
    state: searchParams.getAll(STATE),
  };

  if (!project) {
    return <>Missing project</>;
  }

  const { data: networks = [], error, isLoading } = useNetworks(project);

  useEffect(() => {
    if (error) {
      notify.failure("Loading networks failed", error);
    }
  }, [error]);

  const {
    data: networksOnClusterMembers = [],
    error: clusterNetworkError,
    isLoading: isClusterNetworksLoading,
  } = useNetworksFromClusterMembers(project);

  useEffect(() => {
    if (clusterNetworkError) {
      notify.failure("Loading cluster networks failed", clusterNetworkError);
    }
  }, [clusterNetworkError]);

  useEffect(() => {
    notifyNetworkError(networksOnClusterMembers, notify);
  }, [networksOnClusterMembers]);

  const renderNetworks: LXDNetworkOnClusterMemberFulfilled[] = networks
    .filter((network) => !isClustered || network.managed)
    .map((network) => {
      return {
        ...network,
        promiseStatus: "fulfilled",
        memberName: "Cluster-wide",
      };
    });

  networksOnClusterMembers.filter(isNetwork).forEach((network) => {
    if (!network.managed) {
      renderNetworks.push(network);
    }
  });

  const hasNetworks = renderNetworks.length > 0;

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Type", sortKey: "type", className: "type" },
    { content: "Managed", sortKey: "managed", className: "managed" },
    ...(isClustered ? [{ content: "Cluster member", sortKey: "member" }] : []),
    { content: "IPV4", className: "u-align--right" },
    { content: "IPV6" },
    {
      content: "Description",
      sortKey: "description",
    },
    { content: "Forwards", className: "u-align--right forwards" },
    {
      content: "Used by",
      sortKey: "usedBy",
      className: "u-align--right used-by",
    },
    { content: "State", sortKey: "state", className: "state" },
  ];

  const rows = renderNetworks
    .filter((network) => {
      if (
        !filters.queries.every(
          (q) =>
            network.name.toLowerCase().includes(q) ||
            network.description?.toLowerCase().includes(q),
        )
      ) {
        return false;
      }
      if (filters.type.length > 0 && !filters.type.includes(network.type)) {
        return false;
      }
      if (
        filters.managed.length > 0 &&
        !filters.managed.includes(network.managed ? "yes" : "no")
      ) {
        return false;
      }
      if (
        filters.member.length > 0 &&
        !filters.member.includes(network.memberName)
      ) {
        return false;
      }
      if (
        filters.state.length > 0 &&
        !filters.state.includes(network.status ?? "")
      ) {
        return false;
      }
      return true;
    })
    .map((network) => {
      const href =
        network.memberName === "Cluster-wide"
          ? `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}`
          : `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/member/${encodeURIComponent(network.memberName)}/network/${encodeURIComponent(network.name)}`;

      return {
        key: network.name + network.memberName,
        columns: [
          {
            content: <Link to={href}>{network.name}</Link>,
            role: "rowheader",
            "aria-label": "Name",
          },
          {
            content: renderNetworkType(network.type),
            role: "cell",
            "aria-label": "Type",
            className: "type",
          },
          {
            content: network.managed ? "Yes" : "No",
            role: "cell",
            "aria-label": "Managed",
            className: "managed",
          },
          ...(isClustered
            ? [
                {
                  content: <NetworkClusterMemberChip network={network} />,
                  role: "cell",
                  "aria-label": "Cluster member",
                },
              ]
            : []),
          {
            content: network.config["ipv4.address"],
            className: "u-align--right",
            role: "cell",
            "aria-label": "IPV4",
          },
          {
            content: network.config["ipv6.address"],
            role: "cell",
            "aria-label": "IPV6",
          },
          {
            content: (
              <div className="table-description" title={network.description}>
                {network.description}
              </div>
            ),
            role: "cell",
            "aria-label": "Description",
          },
          {
            content: (
              <NetworkForwardCount network={network} project={project} />
            ),
            role: "cell",
            className: "u-align--right forwards",
            "aria-label": "Forwards",
          },
          {
            content: network.used_by?.length ?? "0",
            role: "cell",
            className: "u-align--right used-by",
            "aria-label": "Used by",
          },
          {
            content: network.status,
            role: "cell",
            "aria-label": "State",
            className: "state",
          },
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type,
          managed: network.managed,
          description: network.description?.toLowerCase(),
          state: network.status,
          usedBy: network.used_by?.length ?? 0,
          member: network.memberName,
        },
      };
    });

  if (isLoading || isClusterNetworksLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <CustomLayout
      mainClassName="network-list"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/explanation/networks/"
                title="Learn more about networking"
              >
                Networks
              </HelpLink>
            </PageHeader.Title>
            <PageHeader.Search>
              <NetworkSearchFilter key={searchParams.get("search")} />
            </PageHeader.Search>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={async () =>
                navigate(
                  `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/networks/create`,
                )
              }
              hasIcon={!isSmallScreen}
              disabled={!canCreateNetworks(currentProject)}
              title={
                canCreateNetworks(currentProject)
                  ? ""
                  : "You do not have permission to create networks in this project"
              }
            >
              {!isSmallScreen && <Icon name="plus" light />}
              <span>Create network</span>
            </Button>
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {hasNetworks && (
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="network-list-table"
            emptyStateMsg="No data to display"
          />
        )}
        {!isLoading && !hasNetworks && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="No networks found"
          >
            <p>There are no networks in this project.</p>
            <p>
              <DocLink docPath="/explanation/networks/" hasExternalIcon>
                Learn more about networks
              </DocLink>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkList;
