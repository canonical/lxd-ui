import type { FC } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Icon, MainTable, Spinner } from "@canonical/react-components";
import { useAuth } from "context/auth";
import { useCurrentProject } from "context/useCurrentProject";
import { useNetworks } from "context/useNetworks";
import { useNetworkAcls } from "context/useNetworkAcls";
import ExplanationTooltip from "components/ExplanationTooltip";
import { capitalizeFirstLetter } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";

const NetworkingCard: FC = () => {
  const { project } = useParams<{ project: string }>();
  const { defaultProject } = useAuth();
  const { isAllProjects } = useCurrentProject();
  const {
    data: networks = [],
    error: networksError,
    isLoading: networksLoading,
  } = useNetworks(project ?? "", undefined, !isAllProjects);
  const {
    data: networkAcls = [],
    error: networkAclsError,
    isLoading: networkAclsLoading,
  } = useNetworkAcls(project ?? "", !isAllProjects);

  const isLoading = networksLoading || networkAclsLoading;
  const error = networksError || networkAclsError;
  const cardClassName = "overview-card networking";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <Icon name="exposed" /> Networking
      </span>
      <ExplanationTooltip
        explanation={
          <>
            Networks can be virtual or physical, and connect instances.
            <br />
            ACLs define network access control rules for traffic on your
            networks.
          </>
        }
        docPath="/explanation/networks/"
        docLabel="Learn more about networks"
      />
    </>
  );

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading networking..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <div className="error-message">
          <Icon name="error" className="margin-right--large" /> Error while
          loading networking: {error.message}
        </div>
      </Card>
    );
  }

  const headers = [
    { content: "Type", className: "type" },
    { content: "Name", className: "name" },
    { content: "Used by", className: "used-by u-align--right" },
  ];

  const formatNetworkType = (type: string) => {
    if (type === "ovn") {
      return "OVN";
    } else if (type === "sriov") {
      return "SR-IOV";
    } else {
      return capitalizeFirstLetter(type);
    }
  };

  const networksRows = networks
    .map((network) => {
      return {
        key: `network-${network.name}`,
        name: network.name,
        columns: [
          {
            content: `${formatNetworkType(network.type)} network`,
            role: "cell",
            "aria-label": "Type",
            className: "type",
          },
          {
            content: network.name,
            role: "rowheader",
            "aria-label": "Name",
            className: "name",
          },
          {
            content: network.used_by?.length ?? 0,
            role: "cell",
            "aria-label": "Used by",
            className: "used-by u-align--right",
          },
        ],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const aclsRows = networkAcls
    .map((acl) => {
      return {
        key: `acl-${acl.name}`,
        name: acl.name,
        columns: [
          {
            content: "ACL",
            role: "cell",
            "aria-label": "Type",
            className: "type",
          },
          {
            content: acl.name,
            role: "rowheader",
            "aria-label": "Name",
            className: "name",
          },
          {
            content: acl.used_by?.length ?? 0,
            role: "cell",
            "aria-label": "Used by",
            className: "used-by u-align--right",
          },
        ],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const rows = [...aclsRows, ...networksRows];

  return (
    <Card className={cardClassName} title={cardTitle}>
      {isAllProjects ? (
        <>
          <h5 className="u-no-margin--bottom">Viewing all projects</h5>
          <p>
            Networking information cannot be displayed across all projects at
            once. Select a project to view its networks and ACLs.
          </p>
        </>
      ) : (
        <MainTable
          id="network-table"
          headers={headers}
          rows={rows}
          className="network-table"
          emptyStateMsg="No networks or ACLs found"
          responsive
        />
      )}
      {!isAllProjects && (
        <div className="card-footer">
          <Link
            to={`${ROOT_PATH}/ui/project/${encodeURIComponent(
              project ?? defaultProject,
            )}/networks`}
          >
            Network details
          </Link>
        </div>
      )}
    </Card>
  );
};

export default NetworkingCard;
