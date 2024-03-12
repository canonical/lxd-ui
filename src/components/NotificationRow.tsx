import { FC } from "react";
import { NotificationConsumer, Row } from "@canonical/react-components";

interface Props {
  className?: string;
}

const NotificationRow: FC<Props> = ({ className }) => {
  return (
    <Row className={className}>
      <NotificationConsumer />
    </Row>
  );
};

export default NotificationRow;
