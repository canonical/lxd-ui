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
import YamlForm from "pages/instances/forms/YamlForm";
import { useNotify } from "context/notify";

interface Props {
  formik: SharedFormikTypes;
  name: string;
  label: string;
  children: ReactNode;
  defaultValue?: string | CpuLimit | MemoryLimit;
  disabled?: boolean;
  readOnlyValue?: string | ReactNode;
}

export const getConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
  readOnlyValue,
}: Props): MainTableRow => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  if (!project) {
    return <>Missing project</>;
  }

  const { data: profiles = [], error: profileError } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  if (profileError) {
    notify.failure("Could not load profiles.", profileError);
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
      return name.startsWith("cloud_init") && inheritedValue !== "-" ? (
        <YamlForm yaml={inheritedValue} autoResize={true} isReadOnly={true} />
      ) : (
        inheritedValue
      );
    }
    if (!isReadOnly) {
      return children;
    }
    return readOnlyValue ? readOnlyValue : values[name];
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
