import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useParams } from "react-router-dom";
import { fetchNetwork } from "api/networks";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import Loader from "components/Loader";

const NetworkDetail: FC = () => {
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

  const { data: network, isLoading } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networks, name],
    queryFn: () => fetchNetwork(name, project),
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className="l-main">
      <div className="p-panel">
        <NetworkDetailHeader network={network} project={project} name={name} />
        <div className="p-panel__content edit-network">
          <NotificationRow />
          {network && <EditNetwork network={network} project={project} />}
        </div>
      </div>
    </main>
  );
};

export default NetworkDetail;
