import React, { FC, useState } from "react";
import { Input, RadioInput, Select } from "@canonical/react-components";

const snapshotOptions = [
  {
    label: "minute",
    value: "* * * * *",
  },
  {
    label: "hour",
    value: "@hourly",
  },
  {
    label: "day",
    value: "@daily",
  },
  {
    label: "week",
    value: "@weekly",
  },
  {
    label: "month",
    value: "@monthly",
  },
  {
    label: "year",
    value: "@yearly",
  },
];

interface Props {
  value?: string;
  setValue: (value: string) => void;
}

const SnapshotScheduleInput: FC<Props> = ({ value, setValue }) => {
  const [cronSyntax, setCronSyntax] = useState(!value?.startsWith("@"));

  return (
    <div>
      <div className="snapshot-schedule">
        <RadioInput
          label="Cron syntax"
          checked={cronSyntax}
          onChange={() => {
            setCronSyntax(true);
            setValue("");
          }}
        />
        <RadioInput
          label="Choose interval"
          checked={!cronSyntax}
          onChange={() => {
            setCronSyntax(false);
            setValue("@daily");
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
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <Select
          id="snapshots_schedule"
          name="snapshots_schedule"
          label="Every"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          options={snapshotOptions}
        />
      )}
    </div>
  );
};

export default SnapshotScheduleInput;
