import type { FC } from "react";
import { EmptyState, Icon, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";
import BaseLayout from "components/BaseLayout";
import TabLinks from "components/TabLinks";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";
import ExternalDocLink from "components/ExternalDocLink";

interface Props {
  activeTab?: string;
}

const Server: FC<Props> = ({ activeTab }) => {
  const tabs = ["Hardware", "Clustering"];

  return (
    <BaseLayout
      title="Server"
      contentClassName="detail-page cluster-member-details"
    >
      <NotificationRow />
      <Row>
        <TabLinks tabs={tabs} activeTab={activeTab} tabUrl={`/ui/server`} />
        {!activeTab && <ClusterMemberHardware />}
        {activeTab === "clustering" && (
          <EmptyState
            className="empty-state"
            image={<Icon name="cluster-host" className="empty-state-icon" />}
            title="This server is not clustered"
          >
            <p>
              <ExternalDocLink
                docPath="/explanation/clustering/"
                content="Learn more about clustering"
              />
            </p>
            <EnableClusteringBtn />
          </EmptyState>
        )}
      </Row>
    </BaseLayout>
  );
};

export default Server;
