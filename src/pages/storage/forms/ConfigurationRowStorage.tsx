import { ReactElement, ReactNode } from "react";
import { CpuLimit, MemoryLimit } from "types/limits";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { FormikProps } from "formik/dist/types";
import { getLxdDefault } from "util/storageVolume";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePool } from "api/storage-pools";
import { getConfigurationRow } from "components/ConfigurationRow";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  name: string;
  label: string | ReactNode;
  children: ReactElement;
  defaultValue?: string | CpuLimit | MemoryLimit;
  disabled?: boolean;
  help?: string;
}

export const getConfigurationRowStorage = ({
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

  // when creating the defaults can be set on the storage pool
  const { data: storagePool } = useQuery({
    queryKey: [queryKeys.storage, formik.values.pool, formik.values.project],
    queryFn: () => fetchStoragePool(formik.values.pool, formik.values.project),
    enabled: formik.values.isCreating,
  });

  const [inheritedValue, inheritSource] = getLxdDefault(name, storagePool);
  const isReadOnly = formik.values.isReadOnly;

  const getOverrideValue = (): ReactNode => {
    if (typeof values[name] === "boolean") {
      return values[name] ? "true" : "false";
    }
    return values[name] === "" ? "-" : values[name];
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
    inheritedValue,
    inheritSource,
    isReadOnly,
    value: values[name],
    overrideValue: getOverrideValue(),
  });
};
