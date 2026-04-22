import type { FC, ReactNode } from "react";
import { MultiSelect } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { ProjectFormValues } from "types/forms/project";
import { useImageRegistries } from "context/useImageRegistries";

interface Props {
  formik: FormikProps<ProjectFormValues>;
  help?: ReactNode;
}

const ImageRegistrySelector: FC<Props> = ({ formik, help }) => {
  const { data: registries = [] } = useImageRegistries();

  const selectedValues =
    formik.values.restricted_registries?.split(",").filter(Boolean) ?? [];

  const setValues = (values: string[]) => {
    formik.setFieldValue(
      "restricted_registries",
      values.filter(Boolean).join(","),
    );
  };

  return (
    <div className="restricted-image-registries">
      <MultiSelect
        id="restricted_registries"
        placeholder="Select registries"
        help={help}
        items={registries.map((registry) => {
          return { label: registry.name, value: registry.name };
        })}
        selectedItems={selectedValues.map((value) => {
          return { value: value, label: value };
        })}
        onDeselectItem={(item) => {
          setValues(selectedValues.filter((value) => value !== item.value));
        }}
        onSelectItem={(item) => {
          setValues(selectedValues.concat([item.value as string]));
        }}
        onItemsUpdate={(items) => {
          setValues(items.map((item) => item.value as string));
        }}
        variant="condensed"
      />
    </div>
  );
};

export default ImageRegistrySelector;
