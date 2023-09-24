import React, { FC, useState } from "react";
import { Input, RadioInput, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { snapshotOptions } from "util/snapshotOptions";
import ConfigurationTable from "components/ConfigurationTable";
import { getStorageConfigurationRow } from "pages/storage/forms/StorageConfigurationRow";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormSnapshots: FC<Props> = ({ formik }) => {
  const [cronSyntax, setCronSyntax] = useState(
    !formik.values.snapshots_schedule?.startsWith("@")
  );

  return (
    <ConfigurationTable
      rows={[
        getStorageConfigurationRow({
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

        getStorageConfigurationRow({
          formik: formik,
          label: "Expire after",
          name: "snapshots_expiry",
          help: "Controls when snapshots are to be deleted (expects an expression like 1M 2H 3d 4w 5m 6y)",
          defaultValue: "",
          children: <Input placeholder="Enter expiry expression" type="text" />,
        }),

        getStorageConfigurationRow({
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

export default StorageVolumeFormSnapshots;
