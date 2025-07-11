import type { FC } from "react";
import { Row, useNotify } from "@canonical/react-components";
import { Link, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import RenameHeader from "components/RenameHeader";
import Loader from "components/Loader";
import TabLinks from "components/TabLinks";
import { useClusterMember } from "context/useClusterMembers";
import ClusterMemberActions from "pages/cluster/ClusterMemberActions";
import usePanelParams, { panels } from "util/usePanelParams";
import EditClusterMemberPanel from "pages/cluster/panels/EditClusterMemberPanel";
import ClusterMemberResources from "pages/cluster/ClusterMemberResources";
import ClusterMemberOverview from "pages/cluster/ClusterMemberOverview";

const ClusterMemberDetail: FC = () => {
  const panelParams = usePanelParams();
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
    return <Loader isMainComponent />;
  }

  const tabs = ["Overview", "Resources"];

  return (
    <>
      <CustomLayout
        header={
          <RenameHeader
            name={memberName ?? ""}
            parentItems={[
              <Link to="/ui/cluster/members" key={1}>
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
            tabUrl={`/ui/cluster/member/${encodeURIComponent(memberName ?? "")}`}
          />

          {!activeTab && member && <ClusterMemberOverview member={member} />}

          {activeTab === "resources" && member && (
            <ClusterMemberResources member={member} />
          )}
        </Row>
      </CustomLayout>

      {panelParams.panel === panels.editClusterMember && (
        <EditClusterMemberPanel />
      )}
    </>
  );
};

export default ClusterMemberDetail;
