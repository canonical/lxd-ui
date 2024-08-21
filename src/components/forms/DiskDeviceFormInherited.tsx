import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ConfigurationTable from "components/ConfigurationTable";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { InheritedVolume } from "util/configInheritance";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import {
  addNoneDevice,
  findNoneDeviceIndex,
  removeDevice,
} from "util/formDevices";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";
import { getInheritedDeviceRow } from "components/forms/InheritedDeviceRow";
import { ensureEditMode } from "util/instanceEdit";

interface Props {
  formik: InstanceAndProfileFormikProps;
  inheritedVolumes: InheritedVolume[];
}

const DiskDeviceFormInherited: FC<Props> = ({ formik, inheritedVolumes }) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  const rows: MainTableRow[] = [];
  inheritedVolumes.map((item) => {
    const noneDeviceId = findNoneDeviceIndex(item.key, formik);
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
        inherited: (
          <div className="p-text--small u-text--muted u-no-margin--bottom">
            From: {item.source}
          </div>
        ),
        override: isNoneDevice ? (
          <Button
            appearance="base"
            type="button"
            title="Reattach volume"
            onClick={() => {
              ensureEditMode(formik);
              removeDevice(noneDeviceId, formik);
            }}
            className="has-icon u-no-margin--bottom"
          >
            <Icon name="connected"></Icon>
            <span>Reattach</span>
          </Button>
        ) : (
          <DetachDiskDeviceBtn
            onDetach={() => {
              ensureEditMode(formik);
              addNoneDevice(item.key, formik);
            }}
          />
        ),
      }),
    );

    rows.push(
      getInheritedDeviceRow({
        label: "Pool / volume",
        inheritValue: (
          <>
            {item.disk.pool} / {item.disk.source}
          </>
        ),
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );

    rows.push(
      getInheritedDeviceRow({
        label: "Mount point",
        inheritValue: item.disk.path,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );

    rows.push(
      getInheritedDeviceRow({
        label: "Read limit",
        inheritValue: item.disk["limits.read"]
          ? `${item.disk["limits.read"]} IOPS`
          : "none",
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );

    rows.push(
      getInheritedDeviceRow({
        label: "Write limit",
        inheritValue: item.disk["limits.write"]
          ? `${item.disk["limits.write"]} IOPS`
          : "none",
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
      }),
    );
  });

  return inheritedVolumes.length > 0 ? (
    <div className="inherited-devices">
      <h2 className="p-heading--4">Inherited disk devices</h2>
      <ConfigurationTable rows={rows} />
    </div>
  ) : null;
};

export default DiskDeviceFormInherited;
