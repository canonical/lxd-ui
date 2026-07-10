import { Button, Icon } from "@canonical/react-components";
import type { FC, ReactNode } from "react";
import classnames from "classnames";

interface Props {
  title: ReactNode;
  icon: string;
  onClick: () => void;
  isModified?: boolean;
  subText?: ReactNode;
  subTextBelowTitle?: boolean;
  disabled?: boolean;
  onHoverText?: string;
}

const FormLink: FC<Props> = ({
  title,
  icon,
  onClick,
  subText,
  subTextBelowTitle,
  isModified,
  disabled,
  onHoverText,
}) => {
  return (
    <Button
      appearance="base"
      className={classnames("form-link", {
        "form-link--subtext-below": subTextBelowTitle,
      })}
      onClick={onClick}
      type="button"
      disabled={disabled}
      title={onHoverText}
    >
      <span className="form-link__column">
        <Icon name={icon} className="form-link__icon" />
        <span className="form-link__title-wrapper">
          <span className="form-link__title">{title}</span>
          {subTextBelowTitle && subText && (
            <span className="form-link__subtext u-text--muted p-text--small">
              {subText}
            </span>
          )}
        </span>
      </span>
      <span className="form-link__column u-align--right">
        {isModified && <Icon name="status-in-progress-small" />}
        {!subTextBelowTitle && (
          <span className="form-link__count u-text--muted">{subText}</span>
        )}
        <Icon name="chevron-right" />
      </span>
    </Button>
  );
};

export default FormLink;
