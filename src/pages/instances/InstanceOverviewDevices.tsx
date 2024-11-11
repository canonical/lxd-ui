import { FC } from "react";
import { MainTable } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { getInstanceDevices } from "util/helpers";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";
import ResourceLink from "components/ResourceLink";
import { isOtherDevice } from "util/devices";
import InstanceOverviewDeviceDetail from "components/DeviceDetails";

interface Props {
  instance: LxdInstance;
}

const InstanceOverviewDevices: FC<Props> = ({ instance }) => {
  const instanceDevices = getInstanceDevices(instance)
    .filter(([, device]) => {
      return device.type !== "nic" && device.type !== "none";
    })
    // Sort devices by type and name
    .sort((a, b) => {
      const nameA = a[0].toLowerCase();
      const nameB = b[0].toLowerCase();
      const typeA = a[1].type;
      const typeB = b[1].type;
      if (typeA === typeB) {
        return nameA.localeCompare(nameB);
      }

      return typeA.localeCompare(typeB);
    });

  const hasDevices = instanceDevices.length > 0;

  const deviceHeaders = [
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    { content: "Type", sortKey: "type", className: "u-text--muted" },
    { content: "Details", className: "u-text--muted" },
  ];

  const deviceRows = instanceDevices.map(([devicename, device]) => {
    const configUrl = `/ui/project/${instance.project}/instance/${instance.name}/configuration/${isOtherDevice(device) ? "other" : device.type}`;
    return {
      columns: [
        {
          content: (
            <ResourceLink type="device" value={devicename} to={configUrl} />
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: `${device.type}${isRootDisk(device as FormDevice) ? " (root)" : ""}`,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: (
            <InstanceOverviewDeviceDetail
              device={device}
              project={instance.project}
            />
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
          sortable
          className="devices"
        />
      )}
      {!hasDevices && <>-</>}
    </>
  );
};

export default InstanceOverviewDevices;
