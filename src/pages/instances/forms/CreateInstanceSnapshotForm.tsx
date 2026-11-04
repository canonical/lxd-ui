import { useEffect, useState, type FC, type ReactNode } from "react";
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
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useLoadCustomVolumes } from "context/useVolumes";
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
  const { hasInstanceSnapshotsMultiVolume, isSettingsLoading } =
    useSupportedFeatures();
  const canSnapshotCustomVolumes = hasInstanceSnapshotsMultiVolume;
  const {
    data: customVolumes = [],
    isLoading: isCustomVolumesLoading,
    error: customVolumesError,
  } = useLoadCustomVolumes(instance.project, {
    enabled: canSnapshotCustomVolumes,
  });
  // LXD decides which volumes to include, the volume list only feeds the
  // included and not included details
  const attachedDevices = canSnapshotCustomVolumes
    ? getCustomVolumeDevices(instance)
    : [];
  const snapshotDevices = getCustomVolumeDevicesToSnapshot(
    instance,
    customVolumes,
  );
  const hasDevices = attachedDevices.length > 0;
  // keep the checkbox enabled while loading to avoid a layout shift, and when
  // the volumes can't be loaded, as LXD decides which volumes are included
  const isIncludeCustomVolumesEnabled =
    hasDevices &&
    (isCustomVolumesLoading ||
      !!customVolumesError ||
      snapshotDevices.length > 0);

  const formik = useFormik<
    SnapshotFormValues<{ stateful?: boolean; includeCustomVolumes?: boolean }>
  >({
    initialValues: {
      name: "",
      stateful: false,
      includeCustomVolumes: isIncludeCustomVolumesEnabled,
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
      const includeCustomVolumes = !!values.includeCustomVolumes;
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

  // follow the option once the settings and volumes are loaded, without
  // reinitializing the form, which would reset the name the user typed
  useEffect(() => {
    void formik.setFieldValue(
      "includeCustomVolumes",
      isIncludeCustomVolumesEnabled,
    );
  }, [isIncludeCustomVolumesEnabled]);

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
      className="snapshot-disabled-checkbox"
      disabled={!isStateful || !isRunning}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      checked={formik.values.stateful}
      help={getStatefulHelp()}
    />
  );

  const getCustomVolumesHelp = () => {
    if (!hasDevices) {
      return "No custom disk devices are attached to this instance.";
    }
    if (!isIncludeCustomVolumesEnabled) {
      return "All attached custom disk devices are shared with other instances.";
    }
    return undefined;
  };

  const customVolumesCheckbox = (
    <CustomDiskDevicesCheckbox
      id="includeCustomVolumes"
      label="Snapshot custom disk devices attached to this instance. Devices and volumes shared with other instances are not included."
      disabled={!isIncludeCustomVolumesEnabled}
      help={getCustomVolumesHelp()}
      checked={!!formik.values.includeCustomVolumes}
      onChange={(checked) =>
        void formik.setFieldValue("includeCustomVolumes", checked)
      }
      instance={instance}
      includedDevices={snapshotDevices}
      allDevices={attachedDevices}
      isLoading={isCustomVolumesLoading}
      isUnknown={!!customVolumesError}
    />
  );

  return (
    <SnapshotForm
      isEdit={false}
      formik={formik}
      close={close}
      isLoading={isSettingsLoading}
      additionalFormInput={
        <>
          {statefulCheckbox}
          {hasInstanceSnapshotsMultiVolume && customVolumesCheckbox}
        </>
      }
    />
  );
};

export default CreateInstanceSnapshotForm;
