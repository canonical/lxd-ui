import React, { FC, ReactNode } from "react";
import { Button, Col, Icon, Row } from "@canonical/react-components";

interface Props {
  iconName: string;
  iconClass: string;
  title: string;
  message: string | ReactNode;
  linkMessage?: string;
  linkURL?: string;
  buttonLabel?: string;
  buttonAction?: () => void;
  isDisabled?: boolean;
  customButton?: ReactNode;
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
  isDisabled = false,
  customButton,
}) => {
  return (
    <Row className="empty-state">
      <Col size={6} className="col-start-large-4">
        <Icon name={iconName} className={`empty-state-icon ${iconClass}`} />
        <h4>{title}</h4>
        <p>{message}</p>
        {linkMessage && linkURL && (
          <p>
            <a
              className="p-link--external"
              href={linkURL}
              target="_blank"
              rel="noreferrer"
            >
              {linkMessage}
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
        )}
        {customButton}
        {buttonLabel && buttonAction && (
          <Button
            className="empty-state-button"
            appearance="positive"
            onClick={buttonAction}
            disabled={isDisabled}
          >
            {buttonLabel}
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default EmptyState;
