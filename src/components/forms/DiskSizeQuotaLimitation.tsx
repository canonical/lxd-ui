import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { useDocs } from "context/useDocs";
import { btrfsDriver, dirDriver } from "util/storageOptions";

interface Props {
  driver?: string;
}

const DiskSizeQuotaLimitation: FC<Props> = ({ driver }) => {
  const docBaseLink = useDocs();

  const getMessage = () => {
    if (driver === dirDriver) {
      return (
        <>
          Size limit might not be applied. See{" "}
          <a
            href={`${docBaseLink}/reference/storage_dir/#quotas`}
            target="_blank"
            rel="noopener noreferrer"
          >
            directory driver quotas
          </a>
          .
        </>
      );
    }
    if (driver === btrfsDriver) {
      return (
        <>
          Size limit might not be applied. See{" "}
          <a
            href={`${docBaseLink}/reference/storage_btrfs/#quotas`}
            target="_blank"
            rel="noopener noreferrer"
          >
            btrfs driver quotas
          </a>
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
      <Icon name="warning" style={{ marginRight: "0.5rem" }} />
      {message} Use a storage pool with another driver for full quota support.
      <br />
      <br />
    </>
  );
};

export default DiskSizeQuotaLimitation;
