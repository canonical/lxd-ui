import React, { ReactElement, ReactNode } from "react";
import { Button, Icon, Label } from "@canonical/react-components";
import { CpuLimit, MemoryLimit } from "types/limits";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import classnames from "classnames";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  name: string;
  label: string | ReactNode;
  children: ReactElement;
  defaultValue?: string | CpuLimit | MemoryLimit;
  disabled?: boolean;
}

export const getConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
}: Props): MainTableRow => {
  const values = formik.values as unknown as Record<string, string | undefined>;
  const isOverridden = values[name] !== undefined;

  const toggleDefault = () => {
    if (isOverridden) {
      formik.setFieldValue(name, undefined);
    } else {
      formik.setFieldValue(name, defaultValue);
      setTimeout(() => document.getElementById(name)?.focus(), 100);
    }
  };

  const [inheritedValue, inheritSource] = ["", "LXD"];
  const isReadOnly = (formik.values as EditInstanceFormValues).readOnly;
  const getDisplayForm = (): ReactNode => {
    if (isReadOnly) {
      return "-";
    }
    return (
      <div className="override-form">
        <div>
          {React.cloneElement(children, {
            id: name,
            name: name,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            value: values[name],
          })}
        </div>
        <div>
          <Button
            onClick={toggleDefault}
            className="override-btn"
            type="button"
            appearance="base"
            title="Clear override"
          >
            <Icon name="close" className="clear-configuration-icon" />
          </Button>
        </div>
      </div>
    );
  };

  const getInheritedValue = (): ReactNode => {
    return inheritedValue;
  };

  const getOverrideValue = (): ReactNode => {
    return values[name] === "" ? "-" : values[name];
  };

  const displayLabel = isOverridden ? (
    <Label forId={name}>
      <b>{label}</b>
    </Label>
  ) : (
    <b>{label}</b>
  );

  return getConfigurationRowBase({
    configuration: displayLabel,
    inherited: (
      <div
        className={classnames({
          "u-text--muted": isOverridden,
          "u-text--line-through": isOverridden,
        })}
      >
        <div>
          <b>{getInheritedValue()}</b>
        </div>
        <div>From: {inheritSource}</div>
      </div>
    ),
    override: isReadOnly ? (
      getOverrideValue()
    ) : isOverridden ? (
      getDisplayForm()
    ) : (
      <Button
        onClick={toggleDefault}
        className="override-btn"
        type="button"
        disabled={disabled}
        appearance="base"
        title="Create override"
      >
        <Icon name="edit" />
      </Button>
    ),
  });
};

interface BaseProps {
  configuration: ReactNode;
  inherited: ReactNode;
  override: ReactNode;
}

export const getConfigurationRowBase = ({
  configuration,
  inherited,
  override,
}: BaseProps): MainTableRow => {
  return {
    columns: [
      {
        content: configuration,
        className: "configuration",
      },
      {
        content: inherited,
        className: "inherited",
      },
      {
        content: override,
        className: "override",
      },
    ],
  };
};
