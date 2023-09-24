import { ReactElement, ReactNode } from "react";
import { useNotify } from "@canonical/react-components";
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
import { getConfigurationRow } from "components/ConfigurationRow";
import { FormikProps } from "formik/dist/types";

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

export const getInstanceConfigurationRow = ({
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

  const [inheritedValue, inheritSource] = figureInheritedValue(
    formik.values,
    name,
    profiles
  );
  const isReadOnly = (formik.values as EditInstanceFormValues).readOnly;

  const getInheritedValue = (): ReactNode => {
    return readOnlyRenderer ? readOnlyRenderer(inheritedValue) : inheritedValue;
  };

  const getOverrideValue = (): ReactNode => {
    const value = values[name] === "" ? "-" : values[name];
    return readOnlyRenderer ? readOnlyRenderer(value) : value;
  };

  return getConfigurationRow({
    formik: formik as FormikProps<unknown>,
    name,
    label,
    children,
    defaultValue,
    disabled,
    help,
    isOverridden,
    inheritedValue: getInheritedValue(),
    inheritSource,
    isReadOnly,
    value: values[name],
    overrideValue: getOverrideValue(),
  });
};
