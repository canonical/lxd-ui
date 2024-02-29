import { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import { fetchNetworks } from "api/networks";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import NetworkForwardCount from "pages/networks/NetworkForwardCount";

const NetworkList: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

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

  if (error) {
    notify.failure("Loading networks failed", error);
  }

  const hasNetworks = networks.length > 0;

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Type", sortKey: "type" },
    { content: "Managed", sortKey: "managed" },
    { content: "IPV4", className: "u-align--right" },
    { content: "IPV6" },
    { content: "Description", sortKey: "description" },
    { content: "Forwards", className: "u-align--right" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--right" },
    { content: "State", sortKey: "state" },
  ];

  const rows = networks.map((network) => {
    return {
      columns: [
        {
          content: (
            <Link to={`/ui/project/${project}/network/${network.name}`}>
              {network.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: network.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: network.managed ? "Yes" : "No",
          role: "rowheader",
          "aria-label": "Managed",
        },
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
          content: network.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: <NetworkForwardCount network={network} project={project} />,
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
      },
    };
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <BaseLayout
        title={
          <HelpLink
            href={`${docBaseLink}/explanation/networks/`}
            title="Learn more about networking"
          >
            Networks
          </HelpLink>
        }
        controls={
          <>
            {hasNetworks && (
              <Button
                className="u-no-margin--bottom"
                onClick={() => navigate(`/ui/project/${project}/networks/map`)}
              >
                See map
              </Button>
            )}
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={() => navigate(`/ui/project/${project}/networks/create`)}
            >
              Create network
            </Button>
          </>
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
              image={<Icon className="empty-state-icon" name="connected" />}
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
      </BaseLayout>
    </>
  );
};

export default NetworkList;
