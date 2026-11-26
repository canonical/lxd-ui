import type { FC, ReactNode } from "react";
import { MainTable } from "@canonical/react-components";
import {
  isRootDisk,
  isDiskDevice,
  isOtherDevice,
  isVolumeDevice,
} from "util/devices";
import type { FormDevice } from "types/formDevice";
import ResourceLink from "components/ResourceLink";
import DeviceDetails from "./DeviceDetails";
import { useParams } from "react-router-dom";
import type { LxdDeviceValue, LxdDevices } from "types/device";
import DeviceUsedBy, { UNKNOWN_USED_BY } from "./DeviceUsedBy";
import UsedByItem from "components/UsedByItem";
import { getLinkTarget } from "util/usedBy";

interface Props {
  configBaseURL: string;
  devices: LxdDevices;
  location?: string;
  instanceName?: string;
}

const DeviceListTable: FC<Props> = ({
  configBaseURL,
  devices,
  location,
  instanceName,
}) => {
  const { project } = useParams<{ project: string }>();

  const byTypeAndName = (
    a: [string, LxdDeviceValue],
    b: [string, LxdDeviceValue],
  ) => {
    const nameA = a[0].toLowerCase();
    const nameB = b[0].toLowerCase();
    const typeA = a[1].type;
    const typeB = b[1].type;
    if (typeA === typeB) {
      return nameA.localeCompare(nameB);
    }

    return typeA.localeCompare(typeB);
  };

  // Identify non-NIC devices
  const overviewDevices = Object.entries(devices ?? {})
    .filter(([_key, device]) => {
      return device.type !== "nic" && device.type !== "none";
    })
    .sort(byTypeAndName);

  const hasDevices = overviewDevices.length > 0;

  const getUsedByContent = (device: LxdDeviceValue): ReactNode => {
    // the root disk of an instance is only used by that instance
    if (isRootDisk(device as FormDevice) && instanceName) {
      const instance = { name: instanceName, project: project as string };
      return (
        <UsedByItem
          item={instance}
          activeProject={project as string}
          type="instance"
          to={getLinkTarget(instance, "instance")}
        />
      );
    }
    if (!isDiskDevice(device) || !isVolumeDevice(device)) {
      return UNKNOWN_USED_BY;
    }
    return (
      <DeviceUsedBy
        device={device}
        project={project as string}
        location={location}
        instanceName={instanceName}
      />
    );
  };

  const deviceHeaders = [
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    {
      content: "Type",
      sortKey: "type",
      className: "u-text--muted device-type",
    },
    { content: "Details", className: "u-text--muted" },
    { content: "Used by", className: "u-text--muted device-used-by" },
  ];

  const deviceRows = overviewDevices.map(([devicename, device]) => {
    let deviceType: string = device.type;
    if (isDiskDevice(device)) {
      if (isRootDisk(device as FormDevice)) {
        deviceType = "root storage";
      } else {
        deviceType = "custom disk";
      }
    }

    return {
      key: devicename,
      className: "u-row",
      columns: [
        {
          content: (
            <ResourceLink
              type="device"
              value={devicename}
              to={`${configBaseURL}/${isOtherDevice(device) ? "other" : device.type}`}
            />
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          className: "device-type",
          content: deviceType,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: (
            <DeviceDetails
              device={device}
              project={project as string}
              location={location}
            />
          ),
          role: "cell",
          "aria-label": "Details",
        },
        {
          className: "device-used-by",
          content: getUsedByContent(device),
          role: "cell",
          "aria-label": "Used by",
        },
      ],
      sortData: {
        name: devicename.toLowerCase(),
        type: deviceType.toLowerCase(),
      },
    };
  });

  return (
    <>
      {hasDevices && (
        <MainTable
          headers={deviceHeaders}
          rows={deviceRows}
          className="device-table"
          sortable
        />
      )}
      {!hasDevices && <>-</>}
    </>
  );
};

export default DeviceListTable;
