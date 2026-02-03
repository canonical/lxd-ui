import type { FC, ReactNode } from "react";
import { MultiSelect } from "@canonical/react-components";
import { useClusterGroups } from "context/useClusterGroups";
import type { FormikProps } from "formik/dist/types";
import type { ProjectFormValues } from "types/forms/project";

interface Props {
  formik: FormikProps<ProjectFormValues>;
  help?: ReactNode;
}

const ClusterGroupSelector: FC<Props> = ({ formik, help }) => {
  const { data: groups = [] } = useClusterGroups();

  const selectedValues =
    formik.values.restricted_cluster_groups?.split(",").filter(Boolean) ?? [];

  const setValues = (values: string[]) => {
    formik.setFieldValue(
      "restricted_cluster_groups",
      values.filter(Boolean).join(","),
    );
  };

  return (
    <div className="restricted-cluster-groups">
      <MultiSelect
        id="restricted_cluster_groups"
        help={help}
        items={groups.map((group) => {
          return { label: group.name, value: group.name };
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

export default ClusterGroupSelector;
