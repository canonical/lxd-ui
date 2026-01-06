import type { FC } from "react";
import {
  Row,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { Link, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import RenameHeader from "components/RenameHeader";
import TabLinks from "components/TabLinks";
import { useClusterMember } from "context/useClusterMembers";
import ClusterMemberActions from "pages/cluster/ClusterMemberActions";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";
import ClusterMemberOverview from "pages/cluster/ClusterMemberOverview";
import { ROOT_PATH } from "util/rootPath";

const ClusterMemberDetail: FC = () => {
  const notify = useNotify();
  const { name: memberName, activeTab } = useParams<{
    name: string;
    activeTab?: string;
  }>();

  const { data: member, error, isLoading } = useClusterMember(memberName ?? "");

  if (error) {
    notify.failure("Loading cluster member details failed", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const tabs = ["Overview", "Hardware"];

  return (
    <CustomLayout
      header={
        <RenameHeader
          name={memberName ?? ""}
          parentItems={[
            <Link to={`${ROOT_PATH}/ui/cluster/members`} key={1}>
              Cluster members
            </Link>,
          ]}
          isLoaded
          renameDisabledReason="Cannot rename cluster members"
          controls={<ClusterMemberActions member={member} isDetailPage />}
        />
      }
      contentClassName="detail-page cluster-member-details"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`${ROOT_PATH}/ui/cluster/member/${encodeURIComponent(memberName ?? "")}`}
        />

        {!activeTab && member && <ClusterMemberOverview member={member} />}

        {activeTab === "hardware" && member && (
          <ClusterMemberHardware member={member} />
        )}
      </Row>
    </CustomLayout>
  );
};

export default ClusterMemberDetail;
