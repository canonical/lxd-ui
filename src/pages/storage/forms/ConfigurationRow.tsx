import React, { ReactElement, ReactNode } from "react";
import { Button, Icon, Label } from "@canonical/react-components";
import { CpuLimit, MemoryLimit } from "types/limits";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import { FormikProps } from "formik/dist/types";
import { getLxdDefault } from "util/storageVolume";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  name: string;
  label: string | ReactNode;
  children: ReactElement;
  defaultValue?: string | CpuLimit | MemoryLimit;
  disabled?: boolean;
  help?: string;
}

export const getConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
  help,
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

  const [inheritedValue, inheritSource] = [getLxdDefault(name), "LXD"];
  const isReadOnly = formik.values.isReadOnly;
  const getForm = (): ReactNode => {
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
    if (typeof values[name] === "boolean") {
      return values[name] ? "true" : "false";
    }
    return values[name] === "" ? "-" : values[name];
  };

  const displayLabel = isOverridden ? (
    <Label forId={name}>
      <b>{label}</b>
    </Label>
  ) : (
    <b>{label}</b>
  );

  const helpText = help ? (
    <div className="configuration-help">{help}</div>
  ) : null;

  return getConfigurationRowBase({
    configuration: (
      <>
        {displayLabel}
        {helpText}
      </>
    ),
    inherited: (
      <div
        className={classnames({
          "u-text--muted": isOverridden,
          "u-text--line-through": isOverridden,
        })}
      >
        <div className="mono-font">
          <b>{getInheritedValue()}</b>
        </div>
        <div className="p-text--small u-text--muted">From: {inheritSource}</div>
      </div>
    ),
    override: isReadOnly ? (
      getOverrideValue()
    ) : isOverridden ? (
      getForm()
    ) : (
      <Button
        onClick={toggleDefault}
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
