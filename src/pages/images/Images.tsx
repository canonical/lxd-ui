import React, { FC } from "react";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import ImageList from "pages/images/ImageList";
import { Row } from "@canonical/react-components";

const Images: FC = () => {
  return (
    <BaseLayout
      title={
        <HelpLink
          href="https://documentation.ubuntu.com/lxd/en/latest/image-handling/"
          title="Learn more about images"
        >
          Images
        </HelpLink>
      }
    >
      <NotificationRow />
      <Row>
        <ImageList />
      </Row>
    </BaseLayout>
  );
};

export default Images;
