import React, { FC } from "react";
import { Row, Tabs, useNotify } from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "util/slugify";
import CachedImageList from "pages/images/CachedImageList";
import CustomImageList from "pages/images/CustomImageList";
import UploadCustomImageBtn from "pages/images/actions/UploadCustomImageBtn";

const TABS: string[] = ["Cached", "Custom"];

const ImageList: FC = () => {
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
      navigate(`/ui/project/${project}/images`);
    } else {
      navigate(`/ui/project/${project}/images/${newTab}`);
    }
  };

  return (
    <BaseLayout title="Images" controls={<UploadCustomImageBtn />}>
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
            <CachedImageList />
          </div>
        )}

        {activeTab === "custom" && (
          <div role="tabpanel">
            <CustomImageList project={project} />
          </div>
        )}
      </Row>
    </BaseLayout>
  );
};

export default ImageList;
