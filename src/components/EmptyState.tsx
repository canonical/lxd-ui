import React, { FC, ReactNode } from "react";
import { Col, Icon, Row } from "@canonical/react-components";

interface Props {
  iconName: string;
  iconClass: string;
  title: string;
  message: string | ReactNode;
  children: ReactNode;
}

const EmptyState: FC<Props> = ({
  iconName,
  iconClass,
  title,
  message,
  children,
}) => {
  return (
    <Row className="empty-state">
      <Col size={6} className="col-start-large-4">
        <Icon name={iconName} className={`empty-state-icon ${iconClass}`} />
        <h2 className="p-heading--4">{title}</h2>
        <p>{message}</p>
        {children}
      </Col>
    </Row>
  );
};

export default EmptyState;
