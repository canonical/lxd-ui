import React, { ReactElement, ReactNode } from "react";
import { Button, Icon, Label, useNotify } from "@canonical/react-components";
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
  help?: string;
}

export const getConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
  readOnlyRenderer,
  help,
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
    return readOnlyRenderer ? readOnlyRenderer(inheritedValue) : inheritedValue;
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
        className="u-no-margin--bottom"
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
