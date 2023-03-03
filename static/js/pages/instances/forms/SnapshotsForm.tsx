import React, { FC, ReactNode } from "react";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";

export interface SnapshotFormValues {
  snapshots_pattern: string;
  snapshots_expiry: string;
  snapshots_schedule: string;
  snapshots_schedule_stopped: boolean;
}

interface Props {
  formik: FormikProps<FormValues>;
  children?: ReactNode;
}

const SnapshotsForm: FC<Props> = ({ formik, children }) => {
  return (
    <>
      {children}
      <Row>
        <Col size={9}>
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
          <CheckboxInput
            label="Snapshot stopped instances"
            name="snapshots_schedule_stopped"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.snapshots_schedule_stopped}
          />
          <hr />
          <Input
            label="Schedule in cron syntax"
            name="snapshots_schedule"
            help="Cron expression (<minute> <hour> <dom> <month> <dow>), a comma-separated list of schedule aliases (@hourly, @daily, @midnight, @weekly, @monthly, @annually, @yearly), or empty to disable automatic snapshots (the default)"
            type="text"
            value={formik.values.snapshots_schedule}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
        </Col>
      </Row>
    </>
  );
};

export default SnapshotsForm;
