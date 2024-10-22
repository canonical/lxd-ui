import { FC } from "react";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";
import { LxdDeviceValue } from "types/device";
import ResourceLink from "components/ResourceLink";

interface Props {
  device: LxdDeviceValue;
  project: string;
}

const InstanceOverviewDeviceDetail: FC<Props> = ({ device, project }) => {
  if (device.type === "disk") {
    if (isRootDisk(device as FormDevice)) {
      return (
        <>
          <span>pool </span>
          <ResourceLink
            type={"pool"}
            value={device.pool}
            to={`/ui/project/${project}/storage/pool/${device.pool}`}
          />
        </>
      );
    }

    return (
      <>
        <span>
          volume&nbsp;
          <ResourceLink
            type={"volume"}
            value={device.source as string}
            to={`/ui/project/${project}/storage/pool/${device.pool}/volumes/custom/${device.source}`}
          />{" "}
        </span>
        <span> on pool </span>
        <ResourceLink
          type={"pool"}
          value={device.pool}
          to={`/ui/project/${project}/storage/pool/${device.pool}`}
        />
      </>
    );
  }

  if (device.type === "gpu") {
    return (
      <span title={device.pci} className="u-truncate">
        {device.pci ? `pci: ${device.pci}` : `id: ${device.id}`}
      </span>
    );
  }

  if (device.type === "proxy") {
    return (
      <>
        <span
          title={device.listen}
          className="u-truncate"
        >{`listen: ${device.listen}`}</span>{" "}
        <br />
        <span
          title={device.connect}
          className="u-truncate"
        >{`connect: ${device.connect}`}</span>
      </>
    );
  }
  return "-";
};

export default InstanceOverviewDeviceDetail;
