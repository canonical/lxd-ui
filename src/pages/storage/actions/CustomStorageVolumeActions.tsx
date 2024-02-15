import { FC } from "react";
import classnames from "classnames";
import { List } from "@canonical/react-components";
import { LxdStorageVolume } from "types/storage";
import DeleteStorageVolumeBtn from "./DeleteStorageVolumeBtn";
import VolumeAddSnapshotBtn from "./snapshots/VolumeAddSnapshotBtn";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  className?: string;
  snapshotDisabled?: boolean;
}

const CustomStorageVolumeActions: FC<Props> = ({
  volume,
  className,
  project,
  snapshotDisabled,
}) => {
  const toastNotify = useToastNotification();
  return (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={[
        <VolumeAddSnapshotBtn
          key="add-snapshot"
          volume={volume}
          isCTA
          isDisabled={snapshotDisabled}
        />,
        <DeleteStorageVolumeBtn
          key="delete"
          volume={volume}
          project={project}
          onFinish={() => {
            toastNotify.success(`Storage volume ${volume.name} deleted.`);
          }}
        />,
      ]}
    />
  );
};

export default CustomStorageVolumeActions;
