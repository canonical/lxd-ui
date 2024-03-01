import { FC } from "react";
import { Input, Notification } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import { useDocs } from "context/useDocs";
import { useProject } from "context/project";
import { isSnapshotsDisabled } from "util/snapshots";
import SnapshotDiabledWarningLink from "components/SnapshotDiabledWarningLink";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormSnapshots: FC<Props> = ({ formik }) => {
  const docBaseLink = useDocs();
  const { project } = useProject();
  const snapshotDisabled = isSnapshotsDisabled(project);

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title={`Snapshot creation has been disabled for volumes in the project ${project?.name}`}
        >
          <SnapshotDiabledWarningLink project={project} />
        </Notification>
      )}
      <ScrollableConfigurationTable
        rows={[
          getConfigurationRow({
            formik,
            label: "Snapshot name pattern",
            name: "snapshots_pattern",
            defaultValue: "",
            children: (
              <Input
                placeholder="Enter name pattern"
                help={
                  <>
                    Pongo2 template string that represents the snapshot name
                    (used for scheduled snapshots and unnamed snapshots), see{" "}
                    <a
                      href={`${docBaseLink}/reference/instance_options/#instance-options-snapshots-names`}
                      target="_blank"
                      rel="noopener noreferrer"
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
            formik,
            label: "Expire after",
            name: "snapshots_expiry",
            defaultValue: "",
            children: (
              <Input
                placeholder="Enter expiry expression"
                type="text"
                help="Expects an expression like 1M 2H 3d 4w 5m 6y"
              />
            ),
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

export default StorageVolumeFormSnapshots;
