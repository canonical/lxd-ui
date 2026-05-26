import type { FC } from "react";
import { Input } from "@canonical/react-components";
import type { FormikProps } from "formik";
import type { ReplicatorFormValues } from "types/forms/replicator";

interface Props {
  formik: FormikProps<ReplicatorFormValues>;
}

export const SnapshotScheduleInput: FC<Props> = ({ formik }) => {
  return (
    <Input
      {...formik.getFieldProps("schedule")}
      id="schedule"
      name="schedule"
      label="Schedule"
      placeholder="Enter cron expression"
      help="Cron expression specifying replicator schedule: <minute> <hour> <dom> <month> <dow> or a comma-separated list of schedule aliases (@hourly, @daily, @midnight, @weekly, @monthly, @annually, @yearly)."
      type="text"
    />
  );
};
