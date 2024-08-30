import { FC } from "react";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";
import classNames from "classnames";
import { createInstanceBackup } from "api/instances";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import { Link } from "react-router-dom";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
}

const ExportInstanceBtn: FC<Props> = ({ instance, classname, onClose }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();

  const instanceLink = (
    <Link to={`/ui/project/${instance.project}/instance/${instance.name}`}>
      {instance.name}
    </Link>
  );

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
        {backupName}
      </>,
    );
  };

  const getNowIn24Hours = () => {
    const result = new Date();
    result.setHours(result.getHours() + 24);
    return result;
  };

  const exportInstance = () => {
    const in24Hours = getNowIn24Hours();
    const expiresAt = in24Hours.toISOString();
    const currentTime = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .split(".")[0];
    const backupName = `${instance.name}-${currentTime}.tar.gz`;

    toastNotify.info(
      <>
        Backing up instance {instanceLink}.<br />
        Download will start, when the export is ready.
      </>,
    );

    createInstanceBackup(instance.name, instance.project, expiresAt, backupName)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => startDownload(backupName),
          (msg) =>
            toastNotify.failure(
              `Could not download instance ${instance.name}`,
              new Error(msg),
            ),
        );
      })
      .catch((e) =>
        toastNotify.failure(`Could not download instance ${instance.name}`, e),
      )
      .finally(() => {
        onClose?.();
      });
  };

  return (
    <Button
      appearance="default"
      className={classNames("u-no-margin--bottom", classname)}
      onClick={exportInstance}
    >
      Export
    </Button>
  );
};

export default ExportInstanceBtn;
