import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useFormik } from "formik";
import { useToastNotification } from "context/toastNotificationProvider";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  Select,
} from "@canonical/react-components";
import { createInstanceBackup } from "api/instances";
import { useEventQueue } from "context/eventQueue";
import InstanceLinkChip from "../InstanceLinkChip";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useSettings } from "context/useSettings";

interface Props {
  instance: LxdInstance;
  close: () => void;
}

export interface LxdInstanceExport {
  compression: "gzip" | "none";
  exportVersion: string;
  expirationHours: number;
  instanceOnly: boolean;
  optimizedStorage: boolean;
}

const ExportInstanceModal: FC<Props> = ({ instance, close }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const instanceLink = <InstanceLinkChip instance={instance} />;
  const { hasBackupMetadataVersion } = useSupportedFeatures();
  const { data: settings } = useSettings();
  const backupMetadataVersionRange =
    settings?.environment?.backup_metadata_version_range ?? [];

  const startDownload = (backupName: string) => {
    const url = `/1.0/instances/${instance.name}/backups/${backupName}/export?project=${instance.project}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = backupName;
    a.click();
    window.URL.revokeObjectURL(url);

    toastNotify.success(
      <>
        Instance {instanceLink} download started:
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

  const exportInstance = (values: LxdInstanceExport) => {
    const currentTime = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .split(".")[0];
    const backupName = `${instance.name}-${currentTime}.tar${values.compression === "gzip" ? ".gz" : ""}`;

    const payload = JSON.stringify({
      name: backupName,
      expires_at: getNowInHours(values.expirationHours).toISOString(),
      compression_algorithm: values.compression,
      instance_only: values.instanceOnly,
      optimized_storage: values.optimizedStorage,
      export_version: hasBackupMetadataVersion
        ? values.exportVersion
        : undefined,
    });

    createInstanceBackup(instance.name, instance.project, payload)
      .then((operation) => {
        toastNotify.info(
          <>
            Backing up instance {instanceLink}.<br />
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
              `Could not download instance ${instance.name}`,
              new Error(msg),
              instanceLink,
            ),
        );
      })
      .catch((e) =>
        toastNotify.failure(
          `Could not download instance ${instance.name}`,
          e,
          instanceLink,
        ),
      )
      .finally(() => {
        close();
      });
  };

  const formik = useFormik<LxdInstanceExport>({
    initialValues: {
      compression: "gzip",
      exportVersion: "2",
      expirationHours: 6,
      instanceOnly: false,
      optimizedStorage: true,
    },
    onSubmit: (values) => {
      exportInstance(values);
    },
  });

  return (
    <Modal
      close={close}
      className="export-instance-modal"
      title="Export Instance"
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
            onClick={() => void formik.submitForm()}
          >
            Export instance
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
          {...formik.getFieldProps("instanceOnly")}
          type="checkbox"
          label="Export without instance snapshots"
          error={
            formik.touched.instanceOnly ? formik.errors.instanceOnly : null
          }
          checked={formik.values.instanceOnly}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default ExportInstanceModal;
