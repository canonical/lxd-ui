import React, { FC } from "react";
import { Row } from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useParams } from "react-router-dom";
import CachedImageList from "pages/images/CachedImageList";
import CustomIsoList from "pages/storage/CustomIsoList";
import StoragePools from "pages/storage/StoragePools";
import StorageVolumes from "pages/storage/StorageVolumes";
import HelpLink from "components/HelpLink";
import TabLinks from "components/TabLinks";

export const tabs: string[] = [
  "Pools",
  "Volumes",
  "Cached images",
  "Custom ISOs",
];

const Storage: FC = () => {
  const { project, activeTab } = useParams<{
    project: string;
    activeTab?: string;
  }>();

  if (!project) {
    return <>Missing project</>;
  }

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
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/project/${project}/storage`}
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
