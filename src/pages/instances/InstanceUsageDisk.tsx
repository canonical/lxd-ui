import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";

interface Props {
  disk?: {
    free: number;
    total: number;
  };
}

const InstanceUsageDisk: FC<Props> = ({ disk }) => {
  if (!disk) {
    return "";
  }

  const used = disk.total - disk.free;

  return (
    <div>
      <Meter
        percentage={(100 / disk.total) * used}
        text={
          humanFileSize(disk.total - disk.free) +
          " of " +
          humanFileSize(disk.total)
        }
        hoverText={`free: ${humanFileSize(disk.free)}\nused: ${humanFileSize(used)}`}
      />
    </div>
  );
};

export default InstanceUsageDisk;
