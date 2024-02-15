import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ConfigurationTable from "components/ConfigurationTable";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { InheritedVolume } from "util/configInheritance";
import { getDiskDeviceRow } from "./DiskDeviceRow";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import { removeDevice } from "util/formDevices";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";

interface Props {
  formik: InstanceAndProfileFormikProps;
  inheritedVolumes: InheritedVolume[];
}

const DiskDeviceFormInherited: FC<Props> = ({ formik, inheritedVolumes }) => {
  const addNoneDevice = (name: string) => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "none",
      name,
    });
    void formik.setFieldValue("devices", copy);
  };

  const findNoneDevice = (name: string) => {
    return formik.values.devices.findIndex(
      (item) => item.name === name && item.type === "none",
    );
  };

  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  const rows: MainTableRow[] = [];

  inheritedVolumes.map((item) => {
    const noneDeviceId = findNoneDevice(item.key);
    const isNoneDevice = noneDeviceId !== -1;

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top override-with-form",
        configuration: (
          <div
            className={classnames("device-name", {
              "u-text--muted": isNoneDevice,
            })}
          >
            <b>{item.key}</b>
          </div>
        ),
        inherited: "",
        override: readOnly ? (
          isNoneDevice ? (
            <>Detached</>
          ) : null
        ) : isNoneDevice ? (
          <Button
            appearance="base"
            type="button"
            title="Reattach volume"
            onClick={() => removeDevice(noneDeviceId, formik)}
            className="has-icon u-no-margin--bottom"
          >
            <Icon name="connected"></Icon>
            <span>Reattach</span>
          </Button>
        ) : (
          <DetachDiskDeviceBtn onDetach={() => addNoneDevice(item.key)} />
        ),
      }),
    );

    rows.push(
      getDiskDeviceRow({
        label: "Pool / volume",
        inheritValue: (
          <>
            {item.disk.pool} / {item.disk.source}
          </>
        ),
        inheritSource: item.source,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );

    rows.push(
      getDiskDeviceRow({
        label: "Mount point",
        inheritValue: item.disk.path,
        inheritSource: item.source,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );

    rows.push(
      getDiskDeviceRow({
        label: "Read limit",
        inheritValue: item.disk["limits.read"]
          ? `${item.disk["limits.read"]} IOPS`
          : "none",
        inheritSource: item.source,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );

    rows.push(
      getDiskDeviceRow({
        label: "Write limit",
        inheritValue: item.disk["limits.write"]
          ? `${item.disk["limits.write"]} IOPS`
          : "none",
        inheritSource: item.source,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );
  });

  return inheritedVolumes.length > 0 ? (
    <div className="inherited-disk-devices">
      <h2 className="p-heading--4">Inherited devices</h2>
      <ConfigurationTable rows={rows} />
    </div>
  ) : null;
};

export default DiskDeviceFormInherited;
