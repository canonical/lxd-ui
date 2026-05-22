import type { FC } from "react";
import { EmptyState, Icon, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";
import BaseLayout from "components/BaseLayout";
import TabLinks from "components/TabLinks";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";
import DocLink from "components/DocLink";
import { ROOT_PATH } from "util/rootPath";
import ClusterLinkList from "pages/cluster/ClusterLinkList";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  activeTab?: string;
}

const Server: FC<Props> = ({ activeTab }) => {
  const { hasClusterLinks } = useSupportedFeatures();

  const tabs = ["Hardware", "Clustering"];

  if (hasClusterLinks) {
    tabs.push("Cluster links");
  }

  return (
    <BaseLayout
      title="Server"
      contentClassName="detail-page cluster-member-details server"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`${ROOT_PATH}/ui/server`}
        />
        {!activeTab && <ClusterMemberHardware />}
        {activeTab === "clustering" && (
          <EmptyState
            className="empty-state"
            image={<Icon name="cluster-host" className="empty-state-icon" />}
            title="This server is not clustered"
          >
            <p>
              <DocLink docPath="/explanation/clustering/" hasExternalIcon>
                Learn more about clustering
              </DocLink>
            </p>
            <EnableClusteringBtn />
          </EmptyState>
        )}
        {activeTab === "cluster-links" && <ClusterLinkList variant="panel" />}
      </Row>
    </BaseLayout>
  );
};

export default Server;
