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
import { optionAllowDeny } from "util/instanceOptions";
import { CreateInstanceFormValues } from "pages/instances/CreateInstance";

export interface MigrationFormValues {
  migration_stateful?: string;
}

export const migrationPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceKey("migration_stateful")]: values.migration_stateful,
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
      ]}
    />
  );
};

export default MigrationForm;
