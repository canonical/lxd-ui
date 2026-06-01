import { type FC } from "react";
import { useParams } from "react-router-dom";
import { Col, CustomLayout, Row, Spinner } from "@canonical/react-components";
import NotFound from "components/NotFound";
import NotificationRow from "components/NotificationRow";
import { useClusterLink } from "context/useClusterLinks";
import { useReplicatorLoading } from "context/replicatorLoading";
import { useReplicator } from "context/useReplicators";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import ClusterLinkStatus from "pages/cluster/ClusterLinkStatus";
import ReplicatorDetailHeader from "pages/cluster/ReplicatorDetailHeader";
import ReplicatorRunTime from "pages/cluster/ReplicatorRunTime";
import ReplicatorStatus from "pages/cluster/ReplicatorStatus";
import EditReplicatorPanel from "pages/cluster/panels/EditReplicatorPanel";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import usePanelParams, { panels } from "util/usePanelParams";

const ReplicatorDetail: FC = () => {
  const { project, name } = useParams<{
    project: string;
    name: string;
  }>();

  const panelParams = usePanelParams();

  if (!name) {
    return <>Missing name</>;
  }

  const {
    data: replicator,
    error,
    isLoading,
  } = useReplicator(name, project || "default");
  const replicatorRunning = useReplicatorLoading();
  const { data: clusterLink } = useClusterLink(
    replicator?.config?.cluster || "",
  );

  const lastRunError = replicator
    ? replicatorRunning.getLastRunError(replicator)
    : undefined;

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (!replicator) {
    return (
      <NotFound
        entityType="replicator"
        entityName={name}
        errorMessage={error?.message}
      />
    );
  }

  return (
    <>
      <CustomLayout header={<ReplicatorDetailHeader replicator={replicator} />}>
        <NotificationRow />
        <Row className="replicator-detail">
          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">General</h2>
            </Col>
            <Col size={7}>
              <table>
                <tbody>
                  <tr>
                    <th className="u-text--muted">Description</th>
                    <td>{replicator.description || "-"}</td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Source project</th>
                    <td>
                      <ProjectRichChip projectName={replicator.project} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>

          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">Target</h2>
            </Col>
            <Col size={7}>
              <table>
                <tbody>
                  <tr>
                    <th className="u-text--muted">Cluster</th>
                    <td>
                      {replicator.config?.cluster ? (
                        <div className="u-flex">
                          <ClusterLinkRichChip
                            clusterLink={replicator.config?.cluster}
                          />
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Cluster status</th>
                    <td className="status-cell">
                      {clusterLink ? (
                        <ClusterLinkStatus link={clusterLink} />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>

          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">Sync</h2>
            </Col>
            <Col size={7}>
              <table>
                <tbody>
                  <tr>
                    <th className="u-text--muted">Fresh snapshots</th>
                    <td>
                      {replicator.config?.snapshot
                        ? "Sync using an existing snapshot, or automatically create one if needed"
                        : "Take new snapshot before sync"}
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Schedule</th>
                    <td>{replicator.config?.schedule || "-"}</td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Last run at</th>
                    <td>
                      <ReplicatorRunTime replicator={replicator} />
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Status</th>
                    <td className="status-cell">
                      <ReplicatorStatus replicator={replicator} />
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Last error</th>
                    <td>{lastRunError ?? "-"}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.editReplicator && <EditReplicatorPanel />}
    </>
  );
};

export default ReplicatorDetail;
