import type { FC } from "react";
import { isRootDisk } from "util/devices";
import type { FormDevice } from "util/formDevices";
import type { LxdDeviceValue } from "types/device";
import ResourceLink from "components/ResourceLink";
import { isHostDiskDevice } from "util/devices";
import StoragePoolRichChip from "pages/storage/StoragePoolRichChip";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  device: LxdDeviceValue;
  project: string;
  location?: string;
}

const DeviceDetails: FC<Props> = ({ device, project, location }) => {
  if (device.type === "disk") {
    if (isRootDisk(device as FormDevice)) {
      return (
        <>
          Pool{" "}
          <StoragePoolRichChip
            poolName={device.pool ?? ""}
            projectName={project}
            location={location}
          />
        </>
      );
    }

    if (isHostDiskDevice(device)) {
      return device.source;
    }

    return (
      <>
        Volume{" "}
        <ResourceLink
          type="volume"
          value={device.source as string}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(device.pool ?? "")}/volumes/custom/${encodeURIComponent(device.source ?? "")}`}
        />{" "}
        on pool{" "}
        <StoragePoolRichChip
          poolName={device.pool ?? ""}
          projectName={project}
          location={location}
        />
      </>
    );
  }

  if (device.type === "gpu") {
    return (
      <span title={device.pci} className="u-truncate">
        {device.pci ? `PCI  ${device.pci}` : `ID ${device.id}`}
      </span>
    );
  }

  if (device.type === "proxy") {
    return (
      <>
        <div title={device.listen} className="u-truncate">
          Listen: {device.listen}
        </div>
        <div title={device.connect} className="u-truncate">
          Connect: {device.connect}
        </div>
      </>
    );
  }
  return "-";
};

export default DeviceDetails;
