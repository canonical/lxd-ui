import { Button, Icon } from "@canonical/react-components";
import { FC } from "react";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  count: number;
  entity: string;
  icon: string;
  isEditing: boolean;
  isModified: boolean;
  onClick: (entity: string) => void;
}

const PanelFormLink: FC<Props> = ({
  count,
  entity,
  icon,
  isEditing,
  isModified,
  onClick,
}) => {
  return (
    <Button
      appearance="base"
      className="panel-form-link"
      onClick={() => onClick(entity)}
      type="button"
    >
      <span className="panel-form-link__column">
        <Icon name={icon} className="panel-form-link__icon" />
        <span className="panel-form-link__title">
          {isEditing ? "Edit " : "Add "} {pluralize(entity, 2)}
        </span>
      </span>
      <span className="panel-form-link__column u-align--right">
        {isModified && <Icon name="status-in-progress-small" />}
        <span className="panel-form-link__count u-text--muted">
          {count === 0
            ? `No ${pluralize(entity, 2)}`
            : `${count} ${pluralize(entity, count)}`}
        </span>
        <Icon name="chevron-right" />
      </span>
    </Button>
  );
};

export default PanelFormLink;
