import React, { FC, ReactNode, useState } from "react";
import { Input, RadioInput, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { snapshotOptions } from "util/snapshotOptions";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: SharedFormTypes) => {
  return {
    [getInstanceKey("snapshots_pattern")]: values.snapshots_pattern,
    [getInstanceKey("snapshots_schedule_stopped")]:
      values.snapshots_schedule_stopped,
    [getInstanceKey("snapshots_schedule")]: values.snapshots_schedule,
    [getInstanceKey("snapshots_expiry")]: values.snapshots_expiry,
  };
};

interface Props {
  formik: SharedFormikTypes;
  children?: ReactNode;
}

const SnapshotsForm: FC<Props> = ({ formik }) => {
  const [cronSyntax, setCronSyntax] = useState(
    !formik.values.snapshots_schedule?.startsWith("@")
  );

  return (
    <ConfigurationTable
      formik={formik}
      rows={[
        getConfigurationRow({
          formik: formik,
          label: "Snapshot name pattern",
          name: "snapshots_pattern",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter name pattern"
              help={
                <>
                  Pongo2 template string that represents the snapshot name (used
                  for scheduled snapshots and unnamed snapshots), see{" "}
                  <a
                    href="https://documentation.ubuntu.com/lxd/en/latest/reference/instance_options/#instance-options-snapshots-names"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Automatic snapshot names
                  </a>
                </>
              }
              type="text"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Expire after",
          name: "snapshots_expiry",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter expiry expression"
              help="Controls when snapshots are to be deleted (expects an expression like 1M 2H 3d 4w 5m 6y)"
              type="text"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Snapshot stopped instances",
          name: "snapshots_schedule_stopped",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik: formik,
          label: "Schedule",
          name: "snapshots_schedule",
          defaultValue: "",
          children: (
            <div>
              <div className="snapshot-schedule">
                <RadioInput
                  label="Cron syntax"
                  checked={cronSyntax}
                  onChange={() => {
                    setCronSyntax(true);
                    formik.setFieldValue("snapshots_schedule", "");
                  }}
                />
                <RadioInput
                  label="Manual configuration"
                  checked={!cronSyntax}
                  onChange={() => {
                    setCronSyntax(false);
                    formik.setFieldValue("snapshots_schedule", "@daily");
                  }}
                />
              </div>
              {cronSyntax ? (
                <Input
                  id="snapshots_schedule"
                  name="snapshots_schedule"
                  label="Cron expression"
                  placeholder="Enter cron expression"
                  help="<minute> <hour> <dom> <month> <dow>, a comma-separated list of schedule aliases (@hourly, @daily, @midnight, @weekly, @monthly, @annually, @yearly), or empty to disable automatic snapshots (the default)"
                  type="text"
                  value={formik.values.snapshots_schedule}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
              ) : (
                <Select
                  id="snapshots_schedule"
                  name="snapshots_schedule"
                  label="Every"
                  value={formik.values.snapshots_schedule}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  options={snapshotOptions}
                />
              )}
            </div>
          ),
        }),
      ]}
    />
  );
};

export default SnapshotsForm;
