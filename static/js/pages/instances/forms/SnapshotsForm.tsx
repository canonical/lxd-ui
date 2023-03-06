import React, { FC, ReactNode, useState } from "react";
import {
  Col,
  Input,
  RadioInput,
  Row,
  Select,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { booleanFields } from "util/instanceOptions";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (
  values: FormValues | EditInstanceFormValues
) => {
  return {
    ["snapshots.pattern"]: values.snapshots_pattern,
    ["snapshots.schedule.stopped"]: values.snapshots_schedule_stopped,
    ["snapshots.schedule"]: values.snapshots_schedule,
    ["snapshots.expiry"]: values.snapshots_expiry,
  };
};

interface Props {
  formik: FormikProps<FormValues> | FormikProps<EditInstanceFormValues>;
  children?: ReactNode;
}

const SnapshotsForm: FC<Props> = ({ formik, children }) => {
  const [cronSyntax, setCronSyntax] = useState(true);

  return (
    <>
      {children}
      <Row>
        <Col size={8}>
          <Input
            label="Snapshot name pattern"
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
            name="snapshots_pattern"
            type="text"
            value={formik.values.snapshots_pattern}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <Input
            label="Expire after"
            name="snapshots_expiry"
            help="Controls when snapshots are to be deleted (expects an expression like 1M 2H 3d 4w 5m 6y)"
            type="text"
            value={formik.values.snapshots_expiry}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <Select
            label="Snapshot stopped instances"
            name="snapshots_schedule_stopped"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.snapshots_schedule_stopped}
          />
          <hr />
          <div className="snapshot-schedule">
            <RadioInput
              labelClassName="right-margin"
              label="Cron syntax"
              checked={cronSyntax}
              onChange={() => setCronSyntax(true)}
            />
            <RadioInput
              label="Manual configuration"
              checked={!cronSyntax}
              onChange={() => {
                setCronSyntax(false);
                formik.setFieldValue("snapshots_schedule", "* * * * *");
              }}
            />
          </div>
          {cronSyntax ? (
            <Input
              label="Schedule in cron syntax"
              name="snapshots_schedule"
              help="Cron expression (<minute> <hour> <dom> <month> <dow>), a comma-separated list of schedule aliases (@hourly, @daily, @midnight, @weekly, @monthly, @annually, @yearly), or empty to disable automatic snapshots (the default)"
              type="text"
              value={formik.values.snapshots_schedule}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          ) : (
            <>
              <Select
                label="Every"
                name="every"
                onChange={(e) => {
                  const getSchedule = () => {
                    switch (e.target.value) {
                      case "minute":
                        return "* * * * *";
                      case "hour":
                        return "@hourly";
                      case "day":
                        return "@daily";
                      case "week":
                        return "@weekly";
                      case "month":
                        return "@monthly";
                      case "year":
                        return "@yearly";
                    }
                  };
                  formik.setFieldValue("snapshots_schedule", getSchedule());
                }}
                options={[
                  {
                    label: "minute",
                    value: "minute",
                  },
                  {
                    label: "hour",
                    value: "hour",
                  },
                  {
                    label: "day",
                    value: "day",
                  },
                  {
                    label: "week",
                    value: "week",
                  },
                  {
                    label: "month",
                    value: "month",
                  },
                  {
                    label: "year",
                    value: "year",
                  },
                ]}
              />
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

export default SnapshotsForm;
