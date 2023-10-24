import React, { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStoragePool } from "api/storage-pools";
import StoragePoolHeader from "pages/storage/StoragePoolHeader";
import NotificationRow from "components/NotificationRow";
import { slugify } from "util/slugify";
import StoragePoolOverview from "pages/storage/StoragePoolOverview";
import CustomLayout from "components/CustomLayout";
import EditStoragePool from "pages/storage/EditStoragePool";
import { useClusterMembers } from "context/useClusterMembers";

const TABS: string[] = ["Overview", "Configuration"];

const StoragePoolDetail: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data: clusterMembers = [] } = useClusterMembers();
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

  const member = clusterMembers[0]?.server_name ?? undefined;

  const {
    data: pool,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, project, name, member],
    queryFn: () => fetchStoragePool(name, project, member),
  });

  if (error) {
    notify.failure("Loading storage details failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage details..." />;
  } else if (!pool) {
    return <>Loading storage details failed</>;
  }

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/project/${project}/storage/detail/${name}`);
    } else {
      navigate(`/ui/project/${project}/storage/detail/${name}/${newTab}`);
    }
  };

  return (
    <CustomLayout
      header={<StoragePoolHeader name={name} pool={pool} project={project} />}
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            id: slugify(tab),
            active:
              slugify(tab) === activeTab || (tab === "Overview" && !activeTab),
            onClick: () => handleTabChange(slugify(tab)),
          }))}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <StoragePoolOverview pool={pool} project={project} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="configuration">
            <EditStoragePool pool={pool} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StoragePoolDetail;
