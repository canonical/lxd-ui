import React, { FC } from "react";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "util/slugify";
import CachedImageList from "pages/images/CachedImageList";
import CustomIsoList from "pages/storage/CustomIsoList";
import StoragePools from "pages/storage/StoragePools";
import StorageVolumes from "pages/storage/StorageVolumes";
import HelpLink from "components/HelpLink";

const TABS: string[] = ["Pools", "Volumes", "Cached images", "Custom ISOs"];

const Storage: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project, activeTab } = useParams<{
    project: string;
    activeTab?: string;
  }>();

  if (!project) {
    return <>Missing project</>;
  }

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === slugify(TABS[0])) {
      navigate(`/ui/project/${project}/storage`);
    } else {
      navigate(`/ui/project/${project}/storage/${newTab}`);
    }
  };

  return (
    <BaseLayout
      title={
        <HelpLink
          href="https://documentation.ubuntu.com/lxd/en/latest/explanation/storage/"
          title="Learn more about storage pools, volumes and buckets"
        >
          Storage
        </HelpLink>
      }
    >
      <NotificationRow />
      <Row>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            id: slugify(tab),
            active:
              slugify(tab) === activeTab || (tab === TABS[0] && !activeTab),
            onClick: () => handleTabChange(slugify(tab)),
          }))}
        />

        {!activeTab && (
          <div role="tabpanel">
            <StoragePools />
          </div>
        )}

        {activeTab === "volumes" && (
          <div role="volumes">
            <StorageVolumes />
          </div>
        )}

        {activeTab === "cached-images" && (
          <div role="tabpanel">
            <CachedImageList />
          </div>
        )}

        {activeTab === "custom-isos" && (
          <div role="tabpanel">
            <CustomIsoList project={project} />
          </div>
        )}
      </Row>
    </BaseLayout>
  );
};

export default Storage;
