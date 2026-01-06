import type { FC } from "react";
import { useFormik } from "formik";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useSettings } from "context/useSettings";
import type { LxdStorageVolume } from "types/storage";
import VolumeLinkChip from "../VolumeLinkChip";
import { createVolumeBackup } from "api/storage-volumes";
import { addTarget } from "util/target";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  volume: LxdStorageVolume;
  close: () => void;
}

export interface LxdVolumeExport {
  compression: "gzip" | "none";
  exportVersion: string;
  optimizedStorage: boolean;
  expirationHours: number;
  volumeOnly: boolean;
}

const ExportVolumeModal: FC<Props> = ({ volume, close }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const volumeLink = <VolumeLinkChip volume={volume} />;
  const { hasBackupMetadataVersion } = useSupportedFeatures();
  const { data: settings } = useSettings();
  const backupMetadataVersionRange =
    settings?.environment?.backup_metadata_version_range ?? [];

  const startDownload = (backupName: string) => {
    const params = new URLSearchParams();
    params.set("project", volume.project);
    addTarget(params, volume.location);

    const url = `${ROOT_PATH}/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}/backups/${encodeURIComponent(backupName)}/export?${params.toString()}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = backupName;
    a.click();
    window.URL.revokeObjectURL(url);

    toastNotify.success(
      <>
        Volume {volumeLink} download started:
        <br />
        <a href={url}>{backupName}</a>
      </>,
    );
  };

  const getNowInHours = (hours: number) => {
    const result = new Date();
    result.setHours(result.getHours() + hours);
    return result;
  };

  const exportVolume = (values: LxdVolumeExport) => {
    const currentTime = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .split(".")[0];
    const backupName = `${volume.name}-${currentTime}.tar${values.compression === "gzip" ? ".gz" : ""}`;

    const payload = JSON.stringify({
      name: backupName,
      expires_at: getNowInHours(values.expirationHours).toISOString(),
      compression_algorithm: values.compression,
      volume_only: values.volumeOnly,
      optimized_storage: values.optimizedStorage,
      version: hasBackupMetadataVersion
        ? Number(values.exportVersion)
        : undefined,
    });

    createVolumeBackup(volume, payload)
      .then((operation) => {
        toastNotify.info(
          <>
            Backing up volume {volumeLink}.<br />
            Download will start, when the export is ready.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          () => {
            startDownload(backupName);
          },
          (msg) =>
            toastNotify.failure(
              `Could not download volume ${volume.name}`,
              new Error(msg),
              volumeLink,
            ),
        );
      })
      .catch((e) =>
        toastNotify.failure(
          `Could not download volume ${volume.name}`,
          e,
          volumeLink,
        ),
      )
      .finally(() => {
        close();
      });
  };

  const formik = useFormik<LxdVolumeExport>({
    initialValues: {
      compression: "gzip",
      exportVersion: "2",
      expirationHours: 6,
      volumeOnly: false,
      optimizedStorage: true,
    },
    onSubmit: (values) => {
      exportVolume(values);
    },
  });

  return (
    <Modal
      close={close}
      className="export-volume-modal"
      title="Export Volume"
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            onClick={() => void formik.submitForm()}
          >
            Export volume
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Select
          {...formik.getFieldProps("compression")}
          id="project"
          label="Compression"
          help="No compression will be faster, but larger"
          options={[
            { value: "gzip", label: "Gzip" },
            { value: "none", label: "None" },
          ]}
        />
        <Select
          {...formik.getFieldProps("expirationHours")}
          id="project"
          label="Expiration"
          help="Duration that the backup remains on the server"
          options={[
            { value: 1, label: "1 hour" },
            { value: 6, label: "6 hours" },
            { value: 12, label: "12 hours" },
            { value: 24, label: "1 day" },
            { value: 72, label: "3 days" },
            { value: 168, label: "7 days" },
          ]}
        />
        {hasBackupMetadataVersion && (
          <Select
            {...formik.getFieldProps("exportVersion")}
            id="exportVersion"
            label="Export version"
            help="Lower versions allow imports on older LXD versions"
            options={backupMetadataVersionRange.map((version) => ({
              value: version.toString(),
              label: version.toString(),
            }))}
          />
        )}
        <Input
          {...formik.getFieldProps("optimizedStorage")}
          type="checkbox"
          label="Use storage driver optimized format"
          help="Can only be restored on a similar pool"
          checked={formik.values.optimizedStorage}
        />
        <Input
          {...formik.getFieldProps("volumeOnly")}
          type="checkbox"
          label="Export without volume snapshots"
          error={formik.touched.volumeOnly ? formik.errors.volumeOnly : null}
          checked={formik.values.volumeOnly}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default ExportVolumeModal;
