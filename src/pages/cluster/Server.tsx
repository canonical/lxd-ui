import type { FC } from "react";
import { EmptyState, Icon, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";
import BaseLayout from "components/BaseLayout";
import { useDocs } from "context/useDocs";
import TabLinks from "components/TabLinks";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";

interface Props {
  activeTab?: string;
}

const Server: FC<Props> = ({ activeTab }) => {
  const docBaseLink = useDocs();

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
              <a
                href={`${docBaseLink}/explanation/clustering/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about clustering
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
            <EnableClusteringBtn />
          </EmptyState>
        )}
      </Row>
    </BaseLayout>
  );
};

export default Server;
