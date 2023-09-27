import { ReactElement, ReactNode } from "react";
import { CpuLimit, MemoryLimit } from "types/limits";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { getLxdDefault } from "util/networks";
import { getConfigurationRow } from "components/ConfigurationRow";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  name: string;
  label: string | ReactNode;
  children: ReactElement;
  defaultValue?: string | CpuLimit | MemoryLimit | boolean;
  disabled?: boolean;
  help?: string;
}

export const getNetworkConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
  help,
}: Props): MainTableRow => {
  const values = formik.values as unknown as Record<string, string | undefined>;
  const value = values[name];
  const isOverridden = value !== undefined;

  const [inheritedValue, inheritSource] = [getLxdDefault(name), "LXD"];
  const isReadOnly = formik.values.readOnly;
  const overrideValue = value === "" ? "-" : value;

  return getConfigurationRow({
    formik: formik as FormikProps<unknown>,
    name,
    label,
    children,
    defaultValue,
    disabled,
    help,
    isOverridden,
    inheritedValue,
    inheritSource,
    isReadOnly,
    value,
    overrideValue,
  });
};
