import type { FC } from "react";
import { useParams } from "react-router-dom";
import { Row, CustomLayout, Spinner } from "@canonical/react-components";
import NetworkAclDetailHeader from "pages/networks/NetworkAclDetailHeader";
import EditNetworkAcl from "pages/networks/forms/EditNetworkAcl";
import { useNetworkAcl } from "context/useNetworkAcls";
import NotFound from "components/NotFound";

const NetworkAclDetail: FC = () => {
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

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
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
      {!isLoading && !networkAcl && (
        <NotFound
          entityType="network-acl"
          entityName={name}
          errorMessage={error?.message}
        />
      )}
      {!isLoading && networkAcl && (
        <Row>
          <EditNetworkAcl networkAcl={networkAcl} project={project} />
        </Row>
      )}
    </CustomLayout>
  );
};

export default NetworkAclDetail;
