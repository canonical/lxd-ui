import { FC } from "react";
import type { LxdStoragePool } from "types/storage";
import StoragePoolSize from "./StoragePoolSize";

interface Props {
  pool: LxdStoragePool;
}

const StoragePoolOptionLabel: FC<Props> = ({ pool }) => {
  return (
    <div className="label">
      <span key="name" title={pool.name || "-"} className="resource u-truncate">
        {pool.name || "-"}
      </span>
      <span
        key="driver"
        title={pool.driver || "-"}
        className="resource-driver u-truncate"
      >
        {pool.driver || "-"}
      </span>
      <span key="usage" title="Usage" className="resource-usage u-truncate">
        <StoragePoolSize key={pool.name} pool={pool} />
      </span>
    </div>
  );
};

export default StoragePoolOptionLabel;
