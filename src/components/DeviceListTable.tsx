import { FC } from "react";
import { MainTable } from "@canonical/react-components";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";
import ResourceLink from "components/ResourceLink";
import { isOtherDevice } from "util/devices";
import DeviceDetails from "./DeviceDetails";
import { useParams } from "react-router-dom";
import { LxdDeviceValue, LxdDevices } from "types/device";

interface Props {
  configBaseURL: string;
  devices: LxdDevices;
}

const DeviceListTable: FC<Props> = ({ configBaseURL, devices }) => {
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

  const deviceHeaders = [
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    { content: "Type", sortKey: "type", className: "u-text--muted" },
    { content: "Details", className: "u-text--muted" },
  ];

  const deviceRows = overviewDevices.map(([devicename, device]) => {
    return {
      columns: [
        {
          content: (
            <ResourceLink
              type="device"
              value={devicename}
              to={`${configBaseURL}/${isOtherDevice(device) ? "other" : device.type}`}
            />
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: `${device.type} ${isRootDisk(device as FormDevice) ? "(root)" : ""}`,

          role: "cell",
          "aria-label": "Type",
        },
        {
          content: (
            <DeviceDetails device={device} project={project as string} />
          ),
          role: "cell",
          "aria-label": "Details",
        },
      ],
      sortData: {
        name: devicename.toLowerCase(),
        type: device.type,
      },
    };
  });

  return (
    <>
      {hasDevices && (
        <MainTable
          headers={deviceHeaders}
          rows={deviceRows}
          className={"device-table"}
          sortable
        />
      )}
      {!hasDevices && <>-</>}
    </>
  );
};

export default DeviceListTable;
