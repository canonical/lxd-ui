import React, { FC } from "react";
import { Button, Col, Icon, Row } from "@canonical/react-components";

interface Props {
  iconName: string;
  iconClass: string;
  title: string;
  message: string;
  linkMessage: string;
  linkURL: string;
  buttonLabel: string;
  buttonAction: () => void;
}

const EmptyState: FC<Props> = ({
  iconName,
  iconClass,
  title,
  message,
  linkMessage,
  linkURL,
  buttonLabel,
  buttonAction,
}) => {
  return (
    <Row className="empty-state">
      <Col size={6} className="col-start-large-4">
        <Icon name={iconName} className={`empty-state-icon ${iconClass}`} />
        <h4>{title}</h4>
        <p>{message}</p>
        <p>
          <a
            className="p-link--external"
            href={linkURL}
            target="_blank"
            rel="noreferrer"
          >
            {linkMessage}
            <i className="p-icon--external-link empty-state-link"></i>
          </a>
        </p>
        <Button
          className="empty-state-button"
          appearance="positive"
          onClick={buttonAction}
        >
          {buttonLabel}
        </Button>
      </Col>
    </Row>
  );
};

export default EmptyState;
