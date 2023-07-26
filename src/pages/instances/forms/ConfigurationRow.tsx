import React, { ReactElement, ReactNode } from "react";
import { Button, Label, useNotify } from "@canonical/react-components";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchProfiles } from "api/profiles";
import { useParams } from "react-router-dom";
import { CpuLimit, MemoryLimit } from "types/limits";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { LxdProfile } from "types/profile";
import { figureInheritedValue } from "util/instanceConfigInheritance";
import classnames from "classnames";

interface Props {
  formik: SharedFormikTypes;
  name: string;
  label: string | ReactNode;
  children: ReactElement;
  defaultValue?: string | CpuLimit | MemoryLimit;
  disabled?: boolean;
  readOnlyRenderer?: (value: unknown) => string | ReactNode;
}

export const getConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
  readOnlyRenderer,
}: Props): MainTableRow => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  let profiles: LxdProfile[] = [];
  if (project) {
    const { data = [], error: profileError } = useQuery({
      queryKey: [queryKeys.profiles],
      queryFn: () => fetchProfiles(project),
    });
    profiles = data;

    if (profileError) {
      notify.failure("Loading profiles failed", profileError);
    }
  }

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

  const [inheritedValue, inheritSource] = figureInheritedValue(
    formik.values,
    name,
    profiles
  );
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
    const value = inheritedValue === "-" ? "" : inheritedValue;
    return readOnlyRenderer ? readOnlyRenderer(value) : value;
  };

  const getOverrideValue = (): ReactNode => {
    const value = values[name] === "" ? "-" : values[name];
    return readOnlyRenderer ? readOnlyRenderer(value) : value;
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
