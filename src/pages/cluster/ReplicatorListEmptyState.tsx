import type { FC } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@canonical/react-components";
import { CreateReplicatorButton } from "pages/cluster/actions/CreateReplicatorBtn";
import CreateClusterLinkBtn from "pages/cluster/actions/CreateClusterLinkBtn";
import { ROOT_PATH } from "util/rootPath";
import { DOC_BASE_PATH } from "context/DOC_BASE_PATH";
import DsIcon from "components/DsIcon";

interface Props {
  isProjectConfiguration: boolean;
  projectConfigurationInfoNotification: React.ReactNode;
  hasClusterLinks: boolean;
  project?: string;
  cluster?: string;
}

const ReplicatorListEmptyState: FC<Props> = ({
  isProjectConfiguration,
  projectConfigurationInfoNotification,
  hasClusterLinks,
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
              <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster link</Link>.
            </p>
          )}
          <p>
            <a
              href={`${DOC_BASE_PATH}/explanation/replicators/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about replicators
              <DsIcon className="external-link-icon" icon="external-link" />
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
      image={<DsIcon icon="change-version" className="empty-state-icon" />}
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
          <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster link</Link>.
        </p>
      )}
      <p>
        <a
          href={`${DOC_BASE_PATH}/explanation/replicators/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about replicators
          <DsIcon className="external-link-icon" icon="external-link" />
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
