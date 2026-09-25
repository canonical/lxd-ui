import type { FC } from "react";

import { btrfsDriver, dirDriver } from "util/storageOptions";
import DocLink from "components/DocLink";
import DsIcon from "components/DsIcon";

interface Props {
  driver?: string;
}

const DiskSizeQuotaLimitation: FC<Props> = ({ driver }) => {
  const getMessage = () => {
    if (driver === dirDriver) {
      return (
        <>
          Size limit might not be applied. See{" "}
          <DocLink docPath="/reference/storage_dir/#quotas">
            directory driver quotas
          </DocLink>
          .
        </>
      );
    }
    if (driver === btrfsDriver) {
      return (
        <>
          Size limit might not be applied. See{" "}
          <DocLink docPath="/reference/storage_btrfs/#quotas">
            btrfs driver quotas
          </DocLink>
          .
        </>
      );
    }
    return null;
  };

  const message = getMessage();
  if (!message) {
    return null;
  }

  return (
    <>
      <DsIcon icon="warning" style={{ marginRight: "0.5rem" }} />
      {message} Use a storage pool with another driver for full quota support.
      <br />
      <br />
    </>
  );
};

export default DiskSizeQuotaLimitation;
