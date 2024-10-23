import { FC } from "react";
import { MainTable } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { getInstanceDevices, getProfileDevices } from "util/helpers";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";
import ResourceLink from "components/ResourceLink";
import { isOtherDevice } from "util/devices";
import InstanceOverviewDeviceDetail from "../pages/instances/InstanceOverviewDeviceDetail";
import { LxdProfile } from "types/profile";
import { useParams } from "react-router-dom";
import { LxdDeviceValue } from "types/device";

interface Props {
  instance?: LxdInstance;
  profile?: LxdProfile;
}

const DeviceListTable: FC<Props> = ({ instance, profile }) => {
  const { project } = useParams<{ project: string }>();
  let instanceDevices: [string, LxdDeviceValue][] = [];
  let profileDevices: [string, LxdDeviceValue][] = [];

  const compareDevices = (
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

  if (instance) {
    instanceDevices = getInstanceDevices(instance)
      .filter(([, device]) => {
        return device.type !== "nic" && device.type !== "none";
      })
      // Sort devices by type and name
      .sort(compareDevices);
  } else {
    profileDevices = getProfileDevices(profile as LxdProfile)
      .filter(([, device]) => {
        return device.type !== "nic" && device.type !== "none";
      })
      .sort(compareDevices);
  }

  const overviewType = {
    project: project,
    devices: instance ? instanceDevices : profileDevices,
  };

  const hasDevices = overviewType.devices.length > 0;

  const deviceHeaders = [
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    { content: "Type", sortKey: "type", className: "u-text--muted" },
    { content: "Details", className: "u-text--muted" },
  ];

  const deviceRows = overviewType.devices.map(([devicename, device]) => {
    const instanceConfigURL = `/ui/project/${overviewType.project}/instance/${instance?.name}/configuration/${isOtherDevice(device) ? "other" : device.type}`;
    const profileConfigURL = `/ui/project/${overviewType.project}/profile/${profile?.name}/configuration/${isOtherDevice(device) ? "other" : device.type}`;

    return {
      columns: [
        {
          content: (
            <ResourceLink
              type="device"
              value={devicename}
              to={instance ? instanceConfigURL : profileConfigURL}
            />
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: `${device.type} ${isRootDisk(device as FormDevice) ? "(root)" : ""}`,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: (
            <InstanceOverviewDeviceDetail
              device={device}
              project={overviewType.project as string}
            />
          ),
          role: "rowheader",
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
        <MainTable headers={deviceHeaders} rows={deviceRows} sortable />
      )}
      {!hasDevices && <>-</>}
    </>
  );
};

export default DeviceListTable;
