import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import Loader from "components/Loader";
import { Row, useNotify } from "@canonical/react-components";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";
import NetworkForwards from "pages/networks/NetworkForwards";
import { useNetwork } from "context/useNetworks";
import NetworkLeases from "pages/networks/NetworkLeases";

const NetworkDetail: FC = () => {
  const notify = useNotify();

  const { name, project, member, activeTab } = useParams<{
    name: string;
    project: string;
    member: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }

  if (!project) {
    return <>Missing project</>;
  }

  const { data: network, error, isLoading } = useNetwork(name, project, member);

  useEffect(() => {
    if (error) {
      notify.failure("Loading network failed", error);
    }
  }, [error]);

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  const isManagedNetwork = network?.managed;

  const getTabs = () => {
    const type = network?.type ?? "";
    if (type === "physical" || !isManagedNetwork) {
      return ["Configuration"];
    }

    return ["Configuration", "Forwards", "Leases"];
  };

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      <Row>
        <TabLinks
          tabs={getTabs()}
          activeTab={activeTab}
          tabUrl={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(name)}`}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="configuration">
            {network && <EditNetwork network={network} project={project} />}
          </div>
        )}
        {activeTab === "forwards" && (
          <div role="tabpanel" aria-labelledby="forwards">
            {network && <NetworkForwards network={network} project={project} />}
          </div>
        )}
        {activeTab === "leases" && (
          <div role="tabpanel" aria-labelledby="leases">
            {network && <NetworkLeases network={network} project={project} />}
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkDetail;
