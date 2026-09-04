import { Button, Icon } from "@canonical/react-components";
import type { IconName } from "@canonical/ds-assets";
import type { FC, ReactNode } from "react";
import classnames from "classnames";
import DsIcon from "components/DsIcon";

// "storage-pool" and "devtools" have no ds-assets equivalent yet.
type FormLinkIcon = IconName | "storage-pool" | "devtools";

interface Props {
  title: ReactNode;
  icon: FormLinkIcon;
  onClick: () => void;
  isModified?: boolean;
  subText?: ReactNode;
  subTextBelowTitle?: boolean;
  disabled?: boolean;
  onHoverText?: string;
  className?: string;
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
  className,
}) => {
  return (
    <Button
      appearance="base"
      className={classnames(
        "form-link u-no-margin--bottom",
        {
          "form-link--subtext-below": subTextBelowTitle,
        },
        className,
      )}
      onClick={onClick}
      type="button"
      disabled={disabled}
      title={onHoverText}
    >
      <span className="form-link__column">
        {icon === "storage-pool" || icon === "devtools" ? (
          <Icon name={icon} className="form-link__icon" />
        ) : (
          <DsIcon icon={icon} className="form-link__icon" />
        )}
        <span className="form-link__title-wrapper">
          <span className="form-link__title">{title}</span>
          {subTextBelowTitle && subText && (
            <span className="form-link__subtext u-text--muted p-text--small u-no-margin--bottom">
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
        <DsIcon icon="chevron-right" />
      </span>
    </Button>
  );
};

export default FormLink;
