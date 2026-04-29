import type { FC, ReactNode } from "react";
import { Input, Notification, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { optionRenderer } from "util/formFields";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import { useCurrentProject } from "context/useCurrentProject";
import { isSnapshotsDisabled } from "util/snapshots";
import SnapshotDisabledWarningLink from "components/SnapshotDisabledWarningLink";
export { snapshotsPayload } from "util/instanceAndProfilePayloads";

interface Props {
  formik: InstanceAndProfileFormikProps;
  children?: ReactNode;
}

const InstanceSnapshotsForm: FC<Props> = ({ formik }) => {
  const { project } = useCurrentProject();
  const snapshotDisabled = isSnapshotsDisabled(project);

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title={`Snapshot creation has been disabled for instances in the project ${project?.name}`}
        >
          <SnapshotDisabledWarningLink project={project} />
        </Notification>
      )}
      <ScrollableConfigurationTable
        rows={[
          getConfigurationRow({
            formik,
            label: "Snapshot name pattern",
            name: "snapshots_pattern",
            defaultValue: "",
            children: <Input placeholder="Enter name pattern" type="text" />,
          }),

          getConfigurationRow({
            formik,
            label: "Expire after",
            name: "snapshots_expiry",
            defaultValue: "",
            children: (
              <Input placeholder="Enter expiry expression" type="text" />
            ),
          }),

          getConfigurationRow({
            formik,
            label: "Snapshot stopped instances",
            name: "snapshots_schedule_stopped",
            defaultValue: "",
            readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
            children: <Select options={optionYesNo} />,
          }),

          getConfigurationRow({
            formik,
            label: "Schedule",
            name: "snapshots_schedule",
            defaultValue: "",
            children: (
              <SnapshotScheduleInput
                value={formik.values.snapshots_schedule}
                setValue={(val) =>
                  void formik.setFieldValue("snapshots_schedule", val)
                }
              />
            ),
          }),
        ]}
      />
    </>
  );
};

export default InstanceSnapshotsForm;
