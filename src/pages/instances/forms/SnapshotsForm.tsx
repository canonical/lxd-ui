import React, { FC, ReactNode } from "react";
import { Input, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getInstanceConfigurationRow } from "pages/instances/forms/InstanceConfigurationRow";
import InstanceConfigurationTable from "pages/instances/forms/InstanceConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";

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
  return (
    <InstanceConfigurationTable
      rows={[
        getInstanceConfigurationRow({
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

        getInstanceConfigurationRow({
          formik: formik,
          label: "Expire after",
          name: "snapshots_expiry",
          help: "Controls when snapshots are to be deleted",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter expiry expression"
              type="text"
              help="Expects an expression like 1M 2H 3d 4w 5m 6y"
            />
          ),
        }),

        getInstanceConfigurationRow({
          formik: formik,
          label: "Snapshot stopped instances",
          name: "snapshots_schedule_stopped",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getInstanceConfigurationRow({
          formik: formik,
          label: "Schedule",
          name: "snapshots_schedule",
          defaultValue: "",
          children: (
            <SnapshotScheduleInput
              value={formik.values.snapshots_schedule}
              setValue={(val) =>
                formik.setFieldValue("snapshots_schedule", val)
              }
            />
          ),
        }),
      ]}
    />
  );
};

export default SnapshotsForm;
