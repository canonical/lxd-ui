import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";
import ConfigurationTable from "components/ConfigurationTable";
import type { EditInstanceFormValues } from "types/forms/instanceAndProfile";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import type { InheritedDiskDevice } from "util/configInheritance";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  addNoneDevice,
  findNoneDeviceIndex,
  removeDevice,
} from "util/formDevices";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";
import {
  getInheritedDeviceRow,
  getInheritedSourceRow,
} from "components/forms/InheritedDeviceRow";
import { ensureEditMode, isInstanceCreation } from "util/instanceEdit";
import { getProfileFromSource, isHostDiskDevice } from "util/devices";
import DeviceName from "components/forms/DeviceName";
import { isDeviceModified } from "util/formChangeCount";

interface Props {
  formik: InstanceAndProfileFormikProps;
  inheritedDiskDevices: InheritedDiskDevice[];
  project: string;
}

const DiskDeviceFormInherited: FC<Props> = ({
  formik,
  inheritedDiskDevices,
  project,
}) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  const rows: MainTableRow[] = [];
  inheritedDiskDevices.forEach((item) => {
    const noneDeviceId = findNoneDeviceIndex(item.key, formik);
    const isNoneDevice = noneDeviceId !== -1;

    rows.push(
      getConfigurationRowBase({
        className: "override-with-form device-first-row",
        configuration: (
          <DeviceName
            name={item.key}
            hasChanges={isDeviceModified(formik, item.key)}
            isDetached={isNoneDevice}
          />
        ),
        inherited: null,
        override: isNoneDevice ? (
          <div>
            <Button
              appearance="base"
              type="button"
              title={formik.values.editRestriction ?? "Reattach device"}
              onClick={() => {
                ensureEditMode(formik);
                removeDevice(noneDeviceId, formik);
              }}
              className="has-icon u-no-margin--bottom"
              disabled={!!formik.values.editRestriction}
            >
              <Icon name="connected"></Icon>
              <span>Reattach</span>
            </Button>
          </div>
        ) : (
          <div>
            <DetachDiskDeviceBtn
              onDetach={() => {
                ensureEditMode(formik);
                addNoneDevice(item.key, formik);
              }}
              disabledReason={formik.values.editRestriction}
              isInstanceCreation={isInstanceCreation(formik)}
            />
          </div>
        ),
      }),
    );

    rows.push(
      getInheritedSourceRow({
        project,
        profile: getProfileFromSource(item.source),
        isDetached: isNoneDevice,
      }),
    );

    if (isHostDiskDevice(item.disk)) {
      rows.push(
        getInheritedDeviceRow({
          label: "Host path",
          inheritValue: item.disk.source,
          readOnly: readOnly,
          isDeactivated: isNoneDevice,
          disabledReason: formik.values.editRestriction,
        }),
      );
    } else {
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
          disabledReason: formik.values.editRestriction,
        }),
      );
    }

    rows.push(
      getInheritedDeviceRow({
        label: "Mount point",
        inheritValue: item.disk.path,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
        disabledReason: formik.values.editRestriction,
        className: "device-last-row",
      }),
    );
  });

  return inheritedDiskDevices.length > 0 ? (
    <div className="inherited-devices">
      <h2 className="p-heading--4">Inherited disk devices</h2>
      <ConfigurationTable
        rows={rows}
        className="inherited-disk-device-configuration-table"
      />
    </div>
  ) : null;
};

export default DiskDeviceFormInherited;
