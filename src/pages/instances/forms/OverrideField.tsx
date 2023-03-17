import React, { ComponentType, ElementType, FC, ReactNode } from "react";
import { CheckboxInput } from "@canonical/react-components";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchProfiles } from "api/profiles";
import { useParams } from "react-router-dom";
import { figureInheritedValue } from "util/formFields";
import { CpuLimit, MemoryLimit } from "types/limits";
import { TextInput } from "pages/instances/forms/TextInput";

interface Props {
  formik: SharedFormikTypes;
  name: string;
  label: string;
  children: ReactNode;
  defaultValue?: string | CpuLimit | MemoryLimit;
  disabled?: boolean;
  overrideElement?: ElementType | ComponentType;
  onOverride?: () => void;
  onReset?: () => void;
  isSet?: boolean;
}

const OverrideField: FC<Props> = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = undefined,
  overrideElement: OverrideElement = TextInput,
  onOverride,
  onReset,
  isSet,
}) => {
  const { project } = useParams<{ project: string }>();
  if (!project) {
    return <>Missing project</>;
  }

  const { data: profiles = [] } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  const values = formik.values as unknown as Record<string, string | undefined>;
  const isOverridden = isSet !== undefined ? isSet : values[name] !== undefined;

  const toggleDefault = () => {
    if (isOverridden) {
      onReset ? onReset() : formik.setFieldValue(name, undefined);
    } else {
      onOverride ? onOverride() : formik.setFieldValue(name, defaultValue);
    }
  };

  return (
    <div className="override">
      <CheckboxInput
        label="Override"
        checked={isOverridden}
        onChange={toggleDefault}
        disabled={disabled}
      />
      {isOverridden ? (
        children
      ) : (
        <OverrideElement
          disabled
          value={figureInheritedValue(formik.values, name, profiles)}
          id={name}
          label={label}
        />
      )}
    </div>
  );
};

export default OverrideField;
