import { useState, type FC } from "react";
import { Notification, Row } from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import DocLink from "components/DocLink";
import ServerExplanationTooltip from "pages/cluster/ServerExplanationTooltip";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";

const ClusterServer: FC = () => {
  const [showNotification, setShowNotification] = useState(true);

  return (
    <BaseLayout
      mainClassName="cluster-server"
      title={<ServerExplanationTooltip>Server</ServerExplanationTooltip>}
    >
      <Row>
        {showNotification && (
          <Notification
            severity="information"
            title="This server is not clustered"
            className="cluster-server-notification"
            onDismiss={() => {
              setShowNotification(false);
            }}
            actions={[
              <DocLink
                docPath="/explanation/clustering/"
                hasExternalIcon
                className="p-button--link p-notification__action"
                key="doc-link"
              >
                Learn more about clustering
              </DocLink>,
              <EnableClusteringBtn
                key="enable-clustering-btn"
                className="p-button--link p-notification__action"
                hasIcon={false}
              />,
            ]}
          />
        )}
      </Row>
      <div className="cluster-member-hardware-details">
        <ClusterMemberHardware />
      </div>
    </BaseLayout>
  );
};

export default ClusterServer;
