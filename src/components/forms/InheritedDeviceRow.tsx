import { ReactNode } from "react";
import { Button, Icon, Label } from "@canonical/react-components";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import classnames from "classnames";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  id?: string;
  label: string;
  inheritValue: ReactNode;
  inheritSource?: string;
  readOnly: boolean;
  overrideValue?: string | ReactNode;
  overrideForm?: ReactNode;
  addOverride?: () => void;
  clearOverride?: () => void;
  isDeactivated?: boolean;
  className?: string;
  disabledReason?: string;
}

export const getInheritedDeviceRow = ({
  id,
  label,
  inheritValue,
  inheritSource,
  readOnly,
  overrideValue,
  overrideForm,
  addOverride,
  clearOverride,
  isDeactivated,
  className,
  disabledReason,
}: Props): MainTableRow => {
  return getConfigurationRowBase({
    className: classnames("no-border-top", className),
    configuration: id ? (
      !readOnly && overrideValue ? (
        <Label
          forId={id}
          className={classnames({
            "u-text--muted": isDeactivated,
          })}
        >
          {label}
        </Label>
      ) : (
        <p
          className={classnames(
            "p-form__label u-no-margin--bottom u-no-padding--top",
            {
              "u-text--muted": isDeactivated,
            },
          )}
        >
          {label}
        </p>
      )
    ) : (
      <div
        className={classnames({
          "u-text--muted": isDeactivated,
        })}
      >
        {label}
      </div>
    ),
    inherited: inheritValue && (
      <div
        className={classnames({
          "u-text--muted": overrideValue || isDeactivated,
          "u-text--line-through": overrideValue || isDeactivated,
        })}
      >
        <div className="mono-font">
          <b>{inheritValue}</b>
        </div>
        {inheritSource && (
          <div className="p-text--small u-text--muted u-no-margin--bottom">
            From: {inheritSource}
          </div>
        )}
      </div>
    ),
    override: readOnly ? (
      overrideValue ? (
        <div className="mono-font">
          <b>{overrideValue}</b>
        </div>
      ) : (
        ""
      )
    ) : overrideValue ? (
      <div className="override-form">
        <div>{overrideForm}</div>
        {clearOverride && (
          <div>
            <Button
              onClick={clearOverride}
              type="button"
              appearance="base"
              title={disabledReason ?? "Clear override"}
              hasIcon
              className="u-no-margin--bottom"
              disabled={!!disabledReason}
            >
              <Icon name="close" className="clear-configuration-icon" />
            </Button>
          </div>
        )}
      </div>
    ) : (
      addOverride && (
        <Button
          onClick={addOverride}
          type="button"
          appearance="base"
          title={disabledReason ?? "Create override"}
          className="u-no-margin--bottom"
          hasIcon
          disabled={!!disabledReason}
        >
          <Icon name="edit" />
        </Button>
      )
    ),
  });
};
