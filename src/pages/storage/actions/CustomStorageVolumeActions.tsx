import React, { FC } from "react";
import classnames from "classnames";
import { List, useNotify } from "@canonical/react-components";
import { LxdStorageVolume } from "types/storage";
import DeleteStorageVolumeBtn from "./DeleteStorageVolumeBtn";
import VolumeAddSnapshotBtn from "./snapshots/VolumeAddSnapshotBtn";

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
  const notify = useNotify();
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
            notify.success(`Storage volume ${volume.name} deleted.`);
          }}
        />,
      ]}
    />
  );
};

export default CustomStorageVolumeActions;
