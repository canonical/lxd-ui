import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import Loader from "components/Loader";
import { Row, useNotify } from "@canonical/react-components";
import CustomLayout from "components/CustomLayout";
import NetworkAclDetailHeader from "pages/networks/NetworkAclDetailHeader";
import EditNetworkAcl from "pages/networks/forms/EditNetworkAcl";
import { useNetworkAcl } from "context/useNetworkAcls";

const NetworkAclDetail: FC = () => {
  const notify = useNotify();

  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }

  if (!project) {
    return <>Missing project</>;
  }

  const { data: networkAcl, error, isLoading } = useNetworkAcl(name, project);

  useEffect(() => {
    if (error) {
      notify.failure("Loading ACL failed", error);
    }
  }, [error]);

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  return (
    <CustomLayout
      header={
        <NetworkAclDetailHeader
          networkAcl={networkAcl}
          project={project}
          name={name}
        />
      }
      contentClassName="edit-network-acl"
    >
      <Row>
        <NotificationRow />
        {networkAcl && (
          <EditNetworkAcl networkAcl={networkAcl} project={project} />
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkAclDetail;
