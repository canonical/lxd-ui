import React, { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStoragePool } from "api/storage-pools";
import StorageDetailHeader from "pages/storage/StorageDetailHeader";
import NotificationRow from "components/NotificationRow";
import { slugify } from "util/slugify";
import StorageVolumes from "pages/storage/StorageVolumes";
import StorageOverview from "pages/storage/StorageOverview";
import CustomLayout from "components/CustomLayout";

const TABS: string[] = ["Overview", "Volumes"];

const StorageDetail: FC = () => {
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

  const {
    data: storagePool,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, project, name],
    queryFn: () => fetchStoragePool(name, project),
  });

  if (error) {
    notify.failure("Loading storage details failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage details..." />;
  } else if (!storagePool) {
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
      header={
        <StorageDetailHeader
          name={name}
          storagePool={storagePool}
          project={project}
        />
      }
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
            <StorageOverview name={name} project={project} />
          </div>
        )}

        {activeTab === "volumes" && (
          <div role="tabpanel" aria-labelledby="volumes">
            <StorageVolumes />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StorageDetail;
