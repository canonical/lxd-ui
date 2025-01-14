import { FC } from "react";
import classnames from "classnames";
import { List } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import DeleteStorageVolumeBtn from "./DeleteStorageVolumeBtn";
import VolumeAddSnapshotBtn from "./snapshots/VolumeAddSnapshotBtn";
import { useToastNotification } from "context/toastNotificationProvider";
import { isSnapshotsDisabled } from "util/snapshots";
import { useProject } from "context/project";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  volume: LxdStorageVolume;
  className?: string;
}

const CustomStorageVolumeActions: FC<Props> = ({ volume, className }) => {
  const toastNotify = useToastNotification();
  const { project } = useProject();

  return (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={[
        <VolumeAddSnapshotBtn
          key="add-snapshot"
          volume={volume}
          isCTA
          isDisabled={isSnapshotsDisabled(project)}
        />,
        <DeleteStorageVolumeBtn
          key="delete"
          volume={volume}
          project={project?.name ?? ""}
          onFinish={() => {
            toastNotify.success(
              <>
                Storage volume{" "}
                <ResourceLabel bold type="volume" value={volume.name} />{" "}
                deleted.
              </>,
            );
          }}
        />,
      ]}
    />
  );
};

export default CustomStorageVolumeActions;
