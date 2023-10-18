import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate, useParams } from "react-router-dom";
import { fetchNetwork } from "api/networks";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import Loader from "components/Loader";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import { slugify } from "util/slugify";
import NetworkDetailOverview from "pages/networks/NetworkDetailOverview";
import CustomLayout from "components/CustomLayout";

const TABS: string[] = ["Overview", "Configuration"];

const NetworkDetail: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
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

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/project/${project}/networks/detail/${name}`);
    } else {
      navigate(`/ui/project/${project}/networks/detail/${name}/${newTab}`);
    }
  };

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      <NotificationRow />
      <Row>
        <Tabs
          links={TABS.filter(
            (tab) => tab !== "Configuration" || network?.managed === true,
          ).map((tab) => ({
            label: tab,
            id: slugify(tab),
            active:
              slugify(tab) === activeTab || (tab === "Overview" && !activeTab),
            onClick: () => handleTabChange(slugify(tab)),
          }))}
        />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            {network && <NetworkDetailOverview network={network} />}
          </div>
        )}
        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="configuration">
            {network && <EditNetwork network={network} project={project} />}
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkDetail;
