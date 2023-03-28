import React, { ReactNode } from "react";
import { CheckboxInput, Label } from "@canonical/react-components";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchProfiles } from "api/profiles";
import { useParams } from "react-router-dom";
import { figureInheritedValue } from "util/formFields";
import { CpuLimit, MemoryLimit } from "types/limits";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { LxdProfile } from "types/profile";
import { useNotify } from "context/notify";

interface Props {
  formik: SharedFormikTypes;
  name: string;
  label: string | ReactNode;
  children: ReactNode;
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
      notify.failure("Could not load profiles.", profileError);
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

  const figureDisplayValue = (): ReactNode => {
    if (!isOverridden) {
      return readOnlyRenderer
        ? readOnlyRenderer(inheritedValue)
        : inheritedValue;
    }
    if (!isReadOnly) {
      return children;
    }
    const value = values[name] === "" ? "-" : values[name];
    return readOnlyRenderer ? readOnlyRenderer(value) : value;
  };

  const displayValue = figureDisplayValue();
  const displayLabel = isOverridden ? (
    <Label forId={name}>
      <b>{label}</b>
    </Label>
  ) : (
    <b>{label}</b>
  );

  return getConfigurationRowBase({
    override: (
      <CheckboxInput
        label={undefined}
        checked={isOverridden}
        onChange={toggleDefault}
        disabled={disabled}
      />
    ),
    label: displayLabel,
    value: displayValue,
    defined: isOverridden ? `Current ${formik.values.type}` : inheritSource,
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
