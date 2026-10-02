import type { FC, ReactNode } from "react";
import { MultiSelect, type MultiSelectItem } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { ProjectFormValues } from "types/forms/project";
import { useImageRegistries } from "context/useImageRegistries";
import { REGISTRY_KEYWORD_BUILTIN } from "util/imageRegistry";

interface Props {
  formik: FormikProps<ProjectFormValues>;
  help?: ReactNode;
}

const ImageRegistrySelector: FC<Props> = ({ formik, help }) => {
  const { data: registries = [] } = useImageRegistries();

  const builtinNames: string[] = [];
  const customNames: string[] = [];
  registries.forEach((registry) => {
    if (registry.builtin) {
      builtinNames.push(registry.name);
    } else {
      customNames.push(registry.name);
    }
  });

  const BUILTIN_GROUP = "Built-in registries";
  const items: MultiSelectItem[] = [
    {
      label: "Built-in registries",
      value: REGISTRY_KEYWORD_BUILTIN,
      group: BUILTIN_GROUP,
    },
    ...builtinNames.map((name) => ({
      label: name,
      value: name,
      group: BUILTIN_GROUP,
    })),
    ...customNames.map((name) => ({
      label: name,
      value: name,
      group: "Custom registries",
    })),
  ];

  const selectedValues =
    formik.values.restricted_registries?.split(",").filter(Boolean) ?? [];
  const wasBuiltinChecked = selectedValues.includes(REGISTRY_KEYWORD_BUILTIN);

  const displayedValues = wasBuiltinChecked
    ? [...new Set([...selectedValues, ...builtinNames])]
    : selectedValues;

  const toItem = (value: string): MultiSelectItem =>
    items.find((item) => item.value === value) ?? { label: value, value };

  const setValues = (values: string[]) => {
    const selection = [...new Set(values)];
    const isBuiltinCheckedNow = selection.includes(REGISTRY_KEYWORD_BUILTIN);
    const wasBuiltinJustUnchecked = wasBuiltinChecked && !isBuiltinCheckedNow;

    // built-in names ticked by the keyword are only displayed, never stored
    const shouldRemoveBuiltinNames =
      isBuiltinCheckedNow || wasBuiltinJustUnchecked;
    const newSelection = shouldRemoveBuiltinNames
      ? selection.filter((value) => !builtinNames.includes(value))
      : selection;

    void formik.setFieldValue("restricted_registries", newSelection.join(","));
  };

  return (
    <div className="restricted-image-registries">
      <MultiSelect
        id="restricted_registries"
        placeholder="Select registries"
        help={help}
        items={items}
        selectedItems={displayedValues.map(toItem)}
        disabledItems={wasBuiltinChecked ? builtinNames.map(toItem) : []}
        onItemsUpdate={(updated) => {
          setValues(updated.map((item) => item.value as string));
        }}
        isSortedAlphabetically={false}
        hasSelectedItemsFirst={false}
        dropdownClassName="restricted-image-registries__dropdown"
        variant="condensed"
      />
    </div>
  );
};

export default ImageRegistrySelector;
