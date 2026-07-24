import type { FC } from "react";
import { Card, Icon } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { useIsClustered } from "context/useIsClustered";
import { ROOT_PATH } from "util/rootPath";

const ClusterCard: FC = () => {
  const isClustered = useIsClustered();

  return (
    <Card
      className="overview-card cluster"
      title={
        <>
          <Icon name="cluster-host" /> Clustering
        </>
      }
    >
      <div className="card-content">
        <div>
          <h5>Members (3)</h5>
          <ul>
            <li>
              Leader <span className="u-text--muted">master</span>
            </li>
            <li>
              <strong>2</strong> voters{" "}
              <span className="u-text--muted">node-02, node-03</span>
            </li>
          </ul>
          <p>
            <Icon name="status-succeeded-small" /> 2 online |{" "}
            <Icon name="status-queued-small" /> 1 offline
          </p>
        </div>
        <div>
          <div className="leaderboard-group">
            <h5>Highest memory usage</h5>
            <ol className="leaderboard-list">
              <li className="critical-strain">
                <span className="node-name">node-02</span>{" "}
                <span className="node-value text-danger">
                  95.4% <span className="details">(2.1 / 2.2 GiB)</span>
                </span>
              </li>
              <li>
                <span className="node-name">master</span>{" "}
                <span className="node-value">
                  14.0% <span className="details">(4.2 / 30.0 GiB)</span>
                </span>
              </li>
              <li>
                <span className="node-name">node-03</span>{" "}
                <span className="node-value">
                  10.0% <span className="details">(1.0 / 10.0 GiB)</span>
                </span>
              </li>
            </ol>
          </div>

          <div className="leaderboard-group" style={{ marginTop: "1.5rem" }}>
            <h5>Highest CPU usage</h5>
            <ol className="leaderboard-list">
              <li>
                <span className="node-name">master</span>{" "}
                <span className="node-value">78.2%</span>
              </li>
              <li>
                <span className="node-name">node-02</span>{" "}
                <span className="node-value">41.5%</span>
              </li>
              <li>
                <span className="node-name u-text--muted">
                  {" "}
                  node-03 (Offline)
                </span>
                <span className="node-value u-text--muted">--</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <Link
          to={
            isClustered
              ? `${ROOT_PATH}/ui/cluster/members`
              : `${ROOT_PATH}/ui/cluster/server`
          }
        >
          See more
        </Link>
      </div>
    </Card>
  );
};

export default ClusterCard;
