import { FC } from "react";
import { MainTable } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { getInstanceDevices } from "util/helpers";

interface Props {
  instance: LxdInstance;
}

const InstanceOverviewDevices: FC<Props> = ({ instance }) => {
  const instanceDevices = getInstanceDevices(instance).filter(([, device]) => {
    return device.type !== "nic" && device.type !== "disk";
  });

  const hasDevices = instanceDevices.length > 0;

  const deviceHeaders = [
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    { content: "Type", sortKey: "type", className: "u-text--muted" },
  ];

  const deviceRows = instanceDevices.map(([devicename, device]) => {
    return {
      columns: [
        {
          content: devicename,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: device.type,
          role: "rowheader",
          "aria-label": "Type",
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

export default InstanceOverviewDevices;
