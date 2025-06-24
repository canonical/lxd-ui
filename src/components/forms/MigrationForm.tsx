import type { FC } from "react";
import { Select } from "@canonical/react-components";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import {
  clusterEvacuationOptions,
  optionAllowDeny,
} from "util/instanceOptions";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";

export interface MigrationFormValues {
  migration_stateful?: string;
  cluster_evacuate?: string;
}

export const migrationPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("migration_stateful")]: values.migration_stateful,
    [getInstanceField("cluster_evacuate")]: values.cluster_evacuate,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const MigrationForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.entityType === "instance";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Stateful migration (VMs only)",
          name: "migration_stateful",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          disabledReason: isVmOnlyDisabled
            ? "Only available for virtual machines"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select options={optionAllowDeny} disabled={isVmOnlyDisabled} />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "Cluster evacuation",
          name: "cluster_evacuate",
          defaultValue: "auto",
          readOnlyRenderer: (val) =>
            optionRenderer(val, clusterEvacuationOptions),
          children: <Select options={clusterEvacuationOptions} />,
        }),
      ]}
    />
  );
};

export default MigrationForm;
