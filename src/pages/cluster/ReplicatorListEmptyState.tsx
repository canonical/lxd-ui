import type { FC } from "react";
import { Link } from "react-router-dom";
import { EmptyState, Icon } from "@canonical/react-components";
import { CreateReplicatorButton } from "pages/cluster/actions/CreateReplicatorBtn";
import CreateClusterLinkBtn from "pages/cluster/actions/CreateClusterLinkBtn";
import { getClusterLinkListUrl } from "util/clusterLink";

interface Props {
  isProjectConfiguration: boolean;
  projectConfigurationInfoNotification: React.ReactNode;
  hasClusterLinks: boolean;
  isClustered: boolean;
  docBaseLink: string;
  project?: string;
  cluster?: string;
}

const ReplicatorListEmptyState: FC<Props> = ({
  isProjectConfiguration,
  projectConfigurationInfoNotification,
  hasClusterLinks,
  isClustered,
  docBaseLink,
  project,
  cluster,
}) => {
  if (isProjectConfiguration) {
    return (
      <>
        {projectConfigurationInfoNotification}
        <div className="replicator-list-project-configuration-empty-state">
          <p>
            Replicators periodically copy instances from one cluster to another
            across a cluster link.
          </p>
          <p>There are no replicators configured for this project.</p>
          {!hasClusterLinks && (
            <p>
              To create a replicator, first create a{" "}
              <Link to={getClusterLinkListUrl(isClustered)}>cluster link</Link>.
            </p>
          )}
          <p>
            <a
              href={`${docBaseLink}/explanation/replicators/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about replicators
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
          <CreateReplicatorButton
            className="u-no-margin--bottom"
            project={project}
            cluster={cluster}
            hasClusterLinks={hasClusterLinks}
            appearance="default"
          />
          <CreateClusterLinkBtn appearance="base" />
        </div>
      </>
    );
  }

  return (
    <EmptyState
      className="empty-state"
      image={<Icon name="change-version" className="empty-state-icon" />}
      title="No replicators found"
    >
      <p>
        Replicators periodically copy instances from one cluster to another
        across a cluster link.
      </p>
      <p>There are no replicators configured on this server.</p>
      {!hasClusterLinks && (
        <p>
          To create a replicator, first create a{" "}
          <Link to={getClusterLinkListUrl(isClustered)}>cluster link</Link>.
        </p>
      )}
      <p>
        <a
          href={`${docBaseLink}/explanation/replicators/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about replicators
          <Icon className="external-link-icon" name="external-link" />
        </a>
      </p>
      <CreateReplicatorButton
        hasClusterLinks={hasClusterLinks}
        appearance="positive"
      />
      <CreateClusterLinkBtn appearance="default" />
    </EmptyState>
  );
};

export default ReplicatorListEmptyState;
