import { FC } from "react";
import { Select } from "@canonical/react-components";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import {
  clusterEvacuationOptions,
  optionAllowDeny,
} from "util/instanceOptions";
import { CreateInstanceFormValues } from "pages/instances/CreateInstance";

export interface MigrationFormValues {
  migration_stateful?: string;
  cluster_evacuate?: string;
}

export const migrationPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceKey("migration_stateful")]: values.migration_stateful,
    [getInstanceKey("cluster_evacuate")]: values.cluster_evacuate,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  disableEditReason: string;
}

const MigrationForm: FC<Props> = ({ formik, disableEditReason }) => {
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
          disabled: !!disableEditReason || isVmOnlyDisabled,
          disabledReason:
            disableEditReason ||
            (isVmOnlyDisabled
              ? "Only available for virtual machines"
              : undefined),
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
          disabled: !!disableEditReason,
          disabledReason: disableEditReason,
        }),
      ]}
    />
  );
};

export default MigrationForm;
