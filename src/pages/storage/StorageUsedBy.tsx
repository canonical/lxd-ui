import type { FC } from "react";
import type { LxdStoragePool, LxdStorageVolume } from "types/storage";
import UsedByRow from "components/UsedByRow";

interface Props {
  storage: LxdStoragePool | LxdStorageVolume;
}

const StorageUsedBy: FC<Props> = ({ storage }) => {
  return (
    <table>
      <tbody>
        <UsedByRow entityType="instance" usedBy={storage.used_by} />
        <UsedByRow entityType="profile" usedBy={storage.used_by} />
        <UsedByRow entityType="image" usedBy={storage.used_by} />
        <UsedByRow entityType="snapshot" usedBy={storage.used_by} />
        <UsedByRow entityType="volume" usedBy={storage.used_by} />
        <UsedByRow entityType="bucket" usedBy={storage.used_by} />
      </tbody>
    </table>
  );
};

export default StorageUsedBy;
