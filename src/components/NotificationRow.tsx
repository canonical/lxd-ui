import { FC } from "react";
import { NotificationConsumer, Row } from "@canonical/react-components";

const NotificationRow: FC = () => {
  return (
    <Row>
      <NotificationConsumer />
    </Row>
  );
};

export default NotificationRow;
