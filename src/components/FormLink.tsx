import { Button, Icon } from "@canonical/react-components";
import type { FC, ReactNode } from "react";

interface Props {
  title: ReactNode;
  icon: string;
  onClick: () => void;
  isModified?: boolean;
  subText?: ReactNode;
  disabled?: boolean;
  onHoverText?: string;
}

const FormLink: FC<Props> = ({
  title,
  icon,
  onClick,
  subText,
  isModified,
  disabled,
  onHoverText,
}) => {
  return (
    <Button
      appearance="base"
      className="form-link"
      onClick={onClick}
      type="button"
      disabled={disabled}
      title={onHoverText}
    >
      <span className="form-link__column">
        <Icon name={icon} className="form-link__icon" />
        <span className="form-link__title">{title}</span>
      </span>
      <span className="form-link__column u-align--right">
        {isModified && <Icon name="status-in-progress-small" />}
        <span className="form-link__count u-text--muted">{subText}</span>
        <Icon name="chevron-right" />
      </span>
    </Button>
  );
};

export default FormLink;
