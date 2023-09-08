import React, { ReactElement, ReactNode } from "react";
import { Button, Label } from "@canonical/react-components";
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
    return React.cloneElement(children, {
      id: name,
      name: name,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: values[name],
    });
  };

  const getInheritedValue = (): ReactNode => {
    return inheritedValue;
  };

  const getOverrideValue = (): ReactNode => {
    const value = values[name] === "" ? "-" : values[name];
    return value;
  };

  const displayLabel = isOverridden ? (
    <Label forId={name}>
      <b>{label}</b>
    </Label>
  ) : (
    <b>{label}</b>
  );

  return getConfigurationRowBase({
    override: isOverridden ? (
      <Button
        onClick={toggleDefault}
        className="override-btn u-no-margin--bottom"
        appearance="negative"
        type="button"
      >
        Clear
      </Button>
    ) : (
      <Button
        onClick={toggleDefault}
        className="override-btn u-no-margin--bottom"
        type="button"
        disabled={disabled}
      >
        Override
      </Button>
    ),
    label: displayLabel,
    value: (
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
    defined: isReadOnly
      ? getOverrideValue()
      : isOverridden
      ? getDisplayForm()
      : "-",
  });
};

interface BaseProps {
  override: ReactNode;
  label: ReactNode;
  value: ReactNode;
  defined: ReactNode;
}

export const getConfigurationRowBase = ({
  override,
  label,
  value,
  defined,
}: BaseProps): MainTableRow => {
  return {
    columns: [
      {
        content: override,
        className: "override",
      },
      {
        content: label,
        className: "config",
      },
      {
        content: value,
        className: "value",
      },
      {
        content: defined,
        className: "defined",
      },
    ],
  };
};
