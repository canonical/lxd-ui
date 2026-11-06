import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import type { FilesystemUsage } from "util/metricSelectors";

interface Props {
  filesystem?: FilesystemUsage;
}

const InstanceUsageFilesystem: FC<Props> = ({ filesystem }) => {
  if (!filesystem) {
    return "";
  }

  const used = filesystem.total - filesystem.free;

  return (
    <div>
      <Meter
        percentage={(100 / filesystem.total) * used}
        text={
          humanFileSize(filesystem.total - filesystem.free) +
          " of " +
          humanFileSize(filesystem.total)
        }
        hoverText={`used: ${humanFileSize(used)}\nfree: ${humanFileSize(filesystem.free)}`}
      />
    </div>
  );
};

export default InstanceUsageFilesystem;
