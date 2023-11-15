import React, { FC } from "react";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import ImageList from "pages/images/ImageList";
import { Row } from "@canonical/react-components";
import { useDocs } from "context/useDocs";

const Images: FC = () => {
  const docBaseLink = useDocs();

  return (
    <BaseLayout
      title={
        <HelpLink
          href={`${docBaseLink}/image-handling/`}
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
