import React, { FC, ReactNode, useState } from "react";
import { Input, RadioInput, Select } from "@canonical/react-components";
import { booleanFields } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getOverrideRow } from "pages/instances/forms/OverrideRow";
import OverrideTable from "pages/instances/forms/OverrideTable";
import { snapshotOptions } from "util/snapshotOptions";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: SharedFormTypes) => {
  return {
    ["snapshots.pattern"]: values.snapshots_pattern,
    ["snapshots.schedule.stopped"]: values.snapshots_schedule_stopped,
    ["snapshots.schedule"]: values.snapshots_schedule,
    ["snapshots.expiry"]: values.snapshots_expiry,
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
    <OverrideTable
      rows={[
        getOverrideRow({
          formik: formik,
          label: "Snapshot name pattern",
          name: "snapshots_pattern",
          defaultValue: "",
          children: (
            <Input
              id="snapshots_pattern"
              name="snapshots_pattern"
              placeholder="Enter name pattern"
              help={
                <>
                  Pongo2 template string that represents the snapshot name (used
                  for scheduled snapshots and unnamed snapshots) see{" "}
                  <a
                    className="p-link--external"
                    href="https://linuxcontainers.org/lxd/docs/latest/reference/instance_options/#instance-options-snapshots-names"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Automatic snapshot names
                  </a>
                </>
              }
              type="text"
              value={formik.values.snapshots_pattern}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Expire after",
          name: "snapshots_expiry",
          defaultValue: "",
          children: (
            <Input
              id="snapshots_expiry"
              name="snapshots_expiry"
              placeholder="Enter expiration expression"
              help="Controls when snapshots are to be deleted (expects an expression like 1M 2H 3d 4w 5m 6y)"
              type="text"
              value={formik.values.snapshots_expiry}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Snapshot stopped instances",
          name: "snapshots_schedule_stopped",
          defaultValue: "false",
          children: (
            <Select
              id="snapshots_schedule_stopped"
              name="snapshots_schedule_stopped"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFields}
              value={formik.values.snapshots_schedule_stopped}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Schedule",
          name: "snapshots_schedule",
          defaultValue: "",
          children: (
            <div>
              <div className="snapshot-schedule">
                <RadioInput
                  labelClassName="right-margin"
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
                  placeholder="Enter cron expression"
                  help="Cron expression (<minute> <hour> <dom> <month> <dow>), a comma-separated list of schedule aliases (@hourly, @daily, @midnight, @weekly, @monthly, @annually, @yearly), or empty to disable automatic snapshots (the default)"
                  type="text"
                  value={formik.values.snapshots_schedule}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  autoFocus
                />
              ) : (
                <Select
                  id="snapshots_schedule"
                  label="Every"
                  name="snapshots_schedule"
                  value={formik.values.snapshots_schedule}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  options={snapshotOptions}
                  autoFocus
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
