import { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import { fetchClusterMemberNetworks, fetchNetworks } from "api/networks";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import NetworkForwardCount from "pages/networks/NetworkForwardCount";
import { useSmallScreen } from "context/useSmallScreen";
import { renderNetworkType } from "util/networks";
import ResourceLink from "components/ResourceLink";
import { useClusterMembers } from "context/useClusterMembers";
import PageHeader from "components/PageHeader";
import CustomLayout from "components/CustomLayout";
import NetworkSearchFilter, {
  MANAGED,
  NetworkFilters,
  MEMBER,
  STATE,
  TYPE,
} from "pages/networks/NetworkSearchFilter";

const NetworkList: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const isSmallScreen = useSmallScreen();
  const { data: clusterMembers = [] } = useClusterMembers();
  const isClustered = clusterMembers.length > 0;
  const [searchParams] = useSearchParams();

  const filters: NetworkFilters = {
    queries: searchParams.getAll("query"),
    type: searchParams.getAll(TYPE).map((value) => value.toLowerCase()),
    managed: searchParams.getAll(MANAGED).map((value) => value.toLowerCase()),
    member: searchParams.getAll(MEMBER),
    state: searchParams.getAll(STATE),
  };

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: networks = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  const {
    data: clusterMemberNetworks = [],
    isLoading: isClusterNetworksLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, "default", queryKeys.cluster],
    queryFn: () => fetchClusterMemberNetworks("default", clusterMembers),
    enabled: clusterMembers.length > 0,
  });

  if (error) {
    notify.failure("Loading networks failed", error);
  }

  const renderNetworks = networks
    .filter((item) => !isClustered || item.managed)
    .map((item) => {
      return {
        member: "Cluster-wide",
        network: item,
      };
    });
  clusterMemberNetworks.map((item) => {
    item.memberNetworks.map((network) => {
      if (!network.managed) {
        renderNetworks.push({
          member: item.memberName,
          network: network,
        });
      }
    });
  });

  const hasNetworks = renderNetworks.length > 0;

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Type", sortKey: "type" },
    { content: "Managed", sortKey: "managed" },
    ...(isClustered ? [{ content: "Cluster member", sortKey: "member" }] : []),
    { content: "IPV4", className: "u-align--right" },
    { content: "IPV6" },
    { content: "Description", sortKey: "description" },
    { content: "Forwards", className: "u-align--right" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--right" },
    { content: "State", sortKey: "state" },
  ];

  const rows = renderNetworks
    .filter((item) => {
      if (
        !filters.queries.every(
          (q) =>
            item.network.name.toLowerCase().includes(q) ||
            item.network.description?.toLowerCase().includes(q),
        )
      ) {
        return false;
      }
      if (
        filters.type.length > 0 &&
        !filters.type.includes(item.network.type)
      ) {
        return false;
      }
      if (
        filters.managed.length > 0 &&
        !filters.managed.includes(item.network.managed ? "yes" : "no")
      ) {
        return false;
      }
      if (filters.member.length > 0 && !filters.member.includes(item.member)) {
        return false;
      }
      if (
        filters.state.length > 0 &&
        !filters.state.includes(item.network.status ?? "")
      ) {
        return false;
      }
      return true;
    })
    .map((item) => {
      const member = item.member;
      const network = item.network;

      const href =
        member === "Cluster-wide"
          ? `/ui/project/${project}/network/${network.name}`
          : `/ui/project/${project}/member/${member}/network/${network.name}`;

      return {
        columns: [
          {
            content: <Link to={href}>{network.name}</Link>,
            role: "rowheader",
            "aria-label": "Name",
          },
          {
            content: renderNetworkType(network.type),
            role: "rowheader",
            "aria-label": "Type",
          },
          {
            content: network.managed ? "Yes" : "No",
            role: "rowheader",
            "aria-label": "Managed",
          },
          ...(isClustered
            ? [
                {
                  content:
                    member === "Cluster-wide" ? (
                      <ResourceLink
                        type="cluster-group"
                        value="Cluster wide"
                        to={`/ui/project/${project}/networks?member=Cluster-wide&search=${Number(searchParams.get("search")) + 1}`}
                      />
                    ) : (
                      <ResourceLink
                        type="cluster-member"
                        value={member}
                        to={`/ui/project/${project}/networks?member=${member}&search=${Number(searchParams.get("search")) + 1}`}
                      />
                    ),
                  role: "rowheader",
                  "aria-label": "Cluster member",
                },
              ]
            : []),
          {
            content: network.config["ipv4.address"],
            className: "u-align--right",
            role: "rowheader",
            "aria-label": "IPV4",
          },
          {
            content: network.config["ipv6.address"],
            role: "rowheader",
            "aria-label": "IPV6",
          },
          {
            content: (
              <div className="table-description" title={network.description}>
                {network.description}
              </div>
            ),
            role: "rowheader",
            "aria-label": "Description",
          },
          {
            content: (
              <NetworkForwardCount network={network} project={project} />
            ),
            role: "rowheader",
            className: "u-align--right",
            "aria-label": "Forwards",
          },
          {
            content: network.used_by?.length ?? "0",
            role: "rowheader",
            className: "u-align--right",
            "aria-label": "Used by",
          },
          {
            content: network.status,
            role: "rowheader",
            "aria-label": "State",
          },
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type,
          managed: network.managed,
          description: network.description?.toLowerCase(),
          state: network.status,
          usedBy: network.used_by?.length ?? 0,
          member: member,
        },
      };
    });

  if (isLoading || isClusterNetworksLoading) {
    return <Loader />;
  }

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/explanation/networks/`}
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
            {hasNetworks && (
              <Button
                className="u-no-margin--bottom"
                onClick={() =>
                  void navigate(`/ui/project/${project}/networks/map`)
                }
                hasIcon={!isSmallScreen}
              >
                {!isSmallScreen && <Icon name="map" />}
                <span>See network map</span>
              </Button>
            )}
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={() =>
                void navigate(`/ui/project/${project}/networks/create`)
              }
              hasIcon={!isSmallScreen}
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
            className="u-table-layout--auto"
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
              <a
                href={`${docBaseLink}/explanation/networks/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about networks
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkList;
