import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { btrfsDriver, dirDriver } from "util/storageOptions";
import DocLink from "components/DocLink";

interface Props {
  driver?: string;
}

const DiskSizeQuotaLimitation: FC<Props> = ({ driver }) => {
  const getMessage = () => {
    if (driver === dirDriver) {
      return (
        <>
          Size limit might not be applied. See{" "}
          <DocLink
            docPath="/reference/storage_dir/#quotas"
            content="directory driver quotas"
          />
          .
        </>
      );
    }
    if (driver === btrfsDriver) {
      return (
        <>
          Size limit might not be applied. See{" "}
          <DocLink
            docPath="/reference/storage_btrfs/#quotas"
            content="btrfs driver quotas"
          />
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
