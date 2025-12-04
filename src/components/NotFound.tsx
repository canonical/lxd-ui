import type { FC } from "react";
import { Row, Col, Notification } from "@canonical/react-components";
import { capitalizeFirstLetter } from "util/helpers";
import type { ResourceIconType } from "components/ResourceIcon";
import ResourceIcon from "components/ResourceIcon";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";

interface Props {
  entityType: ResourceIconType;
  entityName?: string;
  errorMessage?: string;
}

const NotFound: FC<Props> = ({ entityType, entityName, errorMessage }) => {
  const isSmallScreen = useIsScreenBelow();
  const entityLabel = entityType.replace(/-/g, " ");

  return (
    <Row
      className={classnames("not-found u-no-margin--left", {
        "u-flex-column": isSmallScreen,
      })}
    >
      <Col
        size={4}
        className={classnames(
          {
            "u-align--right": !isSmallScreen,
            "u-align--center": isSmallScreen,
          },
          "col-4 col-medium-2 col-small-1",
        )}
      >
        <ResourceIcon type={entityType} className="not-found-icon" />
      </Col>
      <Col size={8} className="u-align--left col-8 col-medium-4 col-small-3">
        <p
          className={classnames(
            {
              "margin-bottom-large": isSmallScreen,
            },
            "p-heading--4",
          )}
        >
          {capitalizeFirstLetter(entityLabel)}{" "}
          {entityName && <code>{entityName}</code>} could not be loaded
        </p>
        <p>
          The {entityLabel} is missing or you do not have the{" "}
          <code>viewer</code> permission for it.
        </p>
        {errorMessage && (
          <Notification severity="negative" borderless>
            <code className="no-background">{errorMessage}</code>
          </Notification>
        )}
      </Col>
    </Row>
  );
};

export default NotFound;
