import type { FC } from "react";
import { MultiSelect } from "@canonical/react-components";
import { useClusterGroups } from "context/useClusterGroups";
import type { FormikProps } from "formik/dist/types";
import type { ProjectFormValues } from "pages/projects/CreateProject";

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ClusterGroupSelector: FC<Props> = ({ formik }) => {
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
