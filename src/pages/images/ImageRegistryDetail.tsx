import type { FC } from "react";
import { useParams } from "react-router-dom";
import { CustomLayout, Row, Spinner } from "@canonical/react-components";
import NotFound from "components/NotFound";
import NotificationRow from "components/NotificationRow";
import TabLinks from "components/TabLinks";
import { useImageRegistry } from "context/useImageRegistries";
import ImageRegistryDetailHeader from "pages/images/ImageRegistryDetailHeader";
import ImageRegistryImages from "pages/images/ImageRegistryImages";
import ImageRegistryConfiguration from "pages/images/ImageRegistryConfiguration";
import { ROOT_PATH } from "util/rootPath";
import { EditImageRegistryPanel } from "./panels/EditImageRegistryPanel";
import usePanelParams, { panels } from "util/usePanelParams";

const ImageRegistryDetail: FC = () => {
  const { name, activeTab } = useParams<{
    name: string;
    activeTab?: string;
  }>();
  const panelParams = usePanelParams();

  if (!name) {
    return <>Missing name</>;
  }

  const { data: imageRegistry, error, isLoading } = useImageRegistry(name);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (!imageRegistry) {
    return (
      <NotFound
        entityType="image-registry"
        entityName={name}
        errorMessage={error?.message}
      />
    );
  }

  const tabs: string[] = ["Images", "Configuration"];

  return (
    <>
      <CustomLayout
        header={<ImageRegistryDetailHeader imageRegistry={imageRegistry} />}
        contentClassName="detail-page"
      >
        <NotificationRow />
        <Row>
          <TabLinks
            tabs={tabs}
            activeTab={activeTab}
            tabUrl={`${ROOT_PATH}/ui/image-registry/${encodeURIComponent(name)}`}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="images">
              <ImageRegistryImages imageRegistry={imageRegistry} />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="configuration">
              <ImageRegistryConfiguration imageRegistry={imageRegistry} />
            </div>
          )}
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.editImageRegistry && (
        <EditImageRegistryPanel />
      )}
    </>
  );
};

export default ImageRegistryDetail;
