import { type FC } from "react";
import { useParams } from "react-router-dom";
import { Col, CustomLayout, Row, Spinner } from "@canonical/react-components";
import NotFound from "components/NotFound";
import NotificationRow from "components/NotificationRow";
import { useReplicatorLoading } from "context/replicatorLoading";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useReplicator } from "context/useReplicators";
import ReplicatorDetailHeader from "pages/cluster/ReplicatorDetailHeader";
import ReplicatorGeneral from "pages/cluster/ReplicatorGeneral";
import ReplicatorLatestSuccessfulRun from "pages/cluster/ReplicatorLatestSuccessfulRun";
import ReplicatorRunTime from "pages/cluster/ReplicatorRunTime";
import ReplicatorStatus from "pages/cluster/ReplicatorStatus";
import EditReplicatorPanel from "pages/cluster/panels/EditReplicatorPanel";
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
  const { hasReplicatorMetrics, isSettingsLoading } = useSupportedFeatures();

  const lastRunError = replicator
    ? replicatorRunning.getLastRunError(replicator)
    : undefined;

  if (isLoading || isSettingsLoading) {
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
          <h2 className="p-heading--3">General</h2>
          <ReplicatorGeneral replicator={replicator} />
          {hasReplicatorMetrics && (
            <>
              <h2 className="p-heading--3">Runs</h2>
              <ReplicatorLatestSuccessfulRun replicator={replicator} />
            </>
          )}

          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">Sync</h2>
            </Col>
            <Col size={7}>
              <table>
                <tbody>
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
