import { FC } from "react";
import { Row } from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useParams } from "react-router-dom";
import CustomIsoList from "pages/storage/CustomIsoList";
import StoragePools from "pages/storage/StoragePools";
import StorageVolumes from "pages/storage/StorageVolumes";
import HelpLink from "components/HelpLink";
import TabLinks from "components/TabLinks";
import { useDocs } from "context/useDocs";
import { storageTabs } from "util/projects";
import { useSupportedFeatures } from "context/useSupportedFeatures";

const Storage: FC = () => {
  const docBaseLink = useDocs();
  const { project, activeTab } = useParams<{
    project: string;
    activeTab?: string;
  }>();
  const { hasCustomVolumeIso } = useSupportedFeatures();

  if (!project) {
    return <>Missing project</>;
  }

  return (
    <BaseLayout
      title={
        <HelpLink
          href={`${docBaseLink}/explanation/storage/`}
          title="Learn more about storage pools, volumes and buckets"
        >
          Storage
        </HelpLink>
      }
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={
            hasCustomVolumeIso
              ? storageTabs
              : storageTabs.filter((tab) => tab !== "Custom ISOs")
          }
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

        {activeTab === "custom-isos" && hasCustomVolumeIso && (
          <div role="tabpanel">
            <CustomIsoList project={project} />
          </div>
        )}
      </Row>
    </BaseLayout>
  );
};

export default Storage;
