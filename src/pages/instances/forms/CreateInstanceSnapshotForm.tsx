import { useState, type FC, type ReactNode } from "react";
import type { LxdInstance } from "types/instance";
import {
  CUSTOM_DISK_DEVICES_MESSAGE_SUFFIX,
  getCustomVolumeDevices,
  getCustomVolumeDevicesToSnapshot,
  getInstanceSnapshotSchema,
  isInstanceSnapshotQuery,
  isInstanceStateful,
} from "util/instanceSnapshots";
import SnapshotForm from "components/forms/SnapshotForm";
import { useEventQueue } from "context/eventQueue";
import {
  CheckboxInput,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import type { SnapshotFormValues } from "types/forms/snapshot";
import { getExpiresAt } from "util/snapshots";
import { UNDEFINED_DATE, stringToIsoTime } from "util/helpers";
import { createInstanceSnapshot } from "api/instance-snapshots";
import { getInstanceSnapshotName } from "util/operations";
import InstanceSnapshotLinkChip from "../InstanceSnapshotLinkChip";
import { InstanceRichChip } from "../InstanceRichChip";
import { useCurrentProject } from "context/useCurrentProject";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useLoadCustomVolumes } from "context/useVolumes";
import { isProjectWithVolumes } from "util/projects";
import CustomDiskDevicesCheckbox from "../actions/snapshots/CustomDiskDevicesCheckbox";

interface Props {
  close: () => void;
  instance: LxdInstance;
  onSuccess: (message: ReactNode) => void;
}

const CreateInstanceSnapshotForm: FC<Props> = ({
  close,
  instance,
  onSuccess,
}) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const { project, isLoading: isProjectLoading } = useCurrentProject();
  const { hasInstanceSnapshotsMultiVolume, isSettingsLoading } =
    useSupportedFeatures();
  const canSnapshotCustomVolumes =
    hasInstanceSnapshotsMultiVolume && isProjectWithVolumes(project);
  const { data: customVolumes = [], isLoading: isCustomVolumesLoading } =
    useLoadCustomVolumes(instance.project, {
      enabled: canSnapshotCustomVolumes,
    });
  const customVolumeDevices = canSnapshotCustomVolumes
    ? getCustomVolumeDevicesToSnapshot(instance, customVolumes)
    : [];
  const showCustomVolumesCheckbox = customVolumeDevices.length > 0;

  const formik = useFormik<
    SnapshotFormValues<{ stateful?: boolean; includeCustomVolumes?: boolean }>
  >({
    initialValues: {
      name: "",
      stateful: false,
      includeCustomVolumes: true,
      expirationDate: null,
      expirationTime: null,
    },
    validateOnMount: true,
    validationSchema: getInstanceSnapshotSchema(instance, controllerState),
    onSubmit: (values, { resetForm }) => {
      notify.clear();
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : UNDEFINED_DATE;
      const includeCustomVolumes =
        showCustomVolumesCheckbox && !!values.includeCustomVolumes;
      const instanceLink = (
        <InstanceRichChip
          instanceName={instance.name}
          projectName={instance.project}
        />
      );
      createInstanceSnapshot(
        instance,
        values.name,
        expiresAt,
        values.stateful || false,
        includeCustomVolumes,
      )
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              queryClient.invalidateQueries({
                predicate: isInstanceSnapshotQuery(includeCustomVolumes),
              });
              onSuccess(
                <>
                  Snapshot{" "}
                  <InstanceSnapshotLinkChip
                    name={getInstanceSnapshotName(operation.metadata)}
                    instance={instance}
                  />{" "}
                  created for instance {instanceLink}
                  {includeCustomVolumes && CUSTOM_DISK_DEVICES_MESSAGE_SUFFIX}.
                </>,
              );
              resetForm();
              close();
            },
            (msg) => {
              toastNotify.failure(
                `Snapshot creation failed for instance ${instance.name}`,
                new Error(msg),
                instanceLink,
              );
              formik.setSubmitting(false);
              close();
            },
          );
        })
        .catch((error: Error) => {
          notify.failure("Snapshot creation failed", error, instanceLink);
          formik.setSubmitting(false);
          close();
        });
    },
  });

  const isStateful = isInstanceStateful(instance);
  const isRunning = instance.status === "Running";
  const getStatefulHelp = () => {
    if (!isStateful) {
      return (
        <>
          <code>migration.stateful</code> config on this instance must be set to
          true.
        </>
      );
    }
    if (!isRunning) {
      return "The instance must be running.";
    }
    return undefined;
  };

  const statefulCheckbox = (
    <CheckboxInput
      id="stateful"
      name="stateful"
      label="Stateful snapshot"
      className="snapshot-stateful-checkbox"
      disabled={!isStateful || !isRunning}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      checked={formik.values.stateful}
      help={getStatefulHelp()}
    />
  );

  const customVolumesCheckbox = (
    <CustomDiskDevicesCheckbox
      id="includeCustomVolumes"
      label="Snapshot custom disk devices attached to this instance"
      help="Devices and volumes shared with other instances are not included."
      checked={!!formik.values.includeCustomVolumes}
      onChange={(checked) =>
        void formik.setFieldValue("includeCustomVolumes", checked)
      }
      includedDevices={customVolumeDevices}
      allDevices={getCustomVolumeDevices(instance)}
    />
  );

  return (
    <SnapshotForm
      isEdit={false}
      formik={formik}
      close={close}
      isLoading={
        isProjectLoading || isSettingsLoading || isCustomVolumesLoading
      }
      additionalFormInput={
        <>
          {statefulCheckbox}
          {showCustomVolumesCheckbox && customVolumesCheckbox}
        </>
      }
    />
  );
};

export default CreateInstanceSnapshotForm;
