import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import ConfigurationTable from "components/ConfigurationTable";
import type {
  CreateInstanceFormValues,
  EditInstanceFormValues,
} from "types/forms/instanceAndProfile";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import type { InheritedDiskDevice } from "types/forms/configInheritance";
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
import { isInstanceCreation } from "util/instanceEdit";
import { ensureEditMode } from "util/editMode";
import { useConfigOptions } from "context/useConfigOptions";
import {
  getConfigFieldDefault,
  getConfigFieldDescription,
  toConfigFields,
} from "util/config";
import {
  getProfileFromSource,
  isHostDiskDevice,
  isIsoDiskDevice,
  isVolumeDevice,
} from "util/devices";
import DeviceName from "components/forms/DeviceName";
import { isDeviceModified } from "util/formChangeCount";
import StoragePoolRichChip from "pages/storage/StoragePoolRichChip";
import classnames from "classnames";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";

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
  const { data: configOptions } = useConfigOptions();

  const diskOptions = configOptions?.configs?.["device-disk"];
  const diskConfigFields = diskOptions ? toConfigFields(diskOptions) : [];

  const labelWithHelpText = (label: string, key: string) => (
    <div className="configuration-label-with-help">
      <span>{label}</span>
      <span className="configuration-help">
        <ConfigFieldDescription
          description={getConfigFieldDescription(diskConfigFields, key)}
        />
      </span>
    </div>
  );

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

    if (isIsoDiskDevice(item)) {
      rows.push(
        getInheritedDeviceRow({
          label: labelWithHelpText("Source", "source"),
          inheritValue: item.disk.source,
          readOnly: readOnly,
          isDeactivated: isNoneDevice,
          disabledReason: formik.values.editRestriction,
        }),
      );
      rows.push(
        getInheritedDeviceRow({
          label: labelWithHelpText("Pool", "pool"),
          inheritValue: (
            <StoragePoolRichChip
              poolName={item.disk.pool ?? ""}
              projectName={project}
              className={classnames({
                "u-text--line-through": isNoneDevice,
              })}
            />
          ),
          readOnly: readOnly,
          isDeactivated: isNoneDevice,
          disabledReason: formik.values.editRestriction,
          monoFont: false,
        }),
      );
    } else {
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

      const isContainerOrProfile =
        formik.values.entityType === "profile" ||
        (formik.values as CreateInstanceFormValues).instanceType ===
          "container";
      const isVolumeBackedDisk = isVolumeDevice(item.disk);
      const showMountPointField =
        !isVolumeBackedDisk || item.disk.path !== undefined;
      const showRecursive = !isVolumeBackedDisk;
      const showShift = isContainerOrProfile && !isVolumeBackedDisk;

      const readonlyValue =
        item.disk.readonly ??
        getConfigFieldDefault(diskConfigFields, "readonly");
      const recursiveValue = showRecursive
        ? (item.disk.recursive ??
          getConfigFieldDefault(diskConfigFields, "recursive"))
        : undefined;
      const requiredValue =
        item.disk.required ??
        getConfigFieldDefault(diskConfigFields, "required");
      const shiftValue = showShift
        ? (item.disk.shift ?? getConfigFieldDefault(diskConfigFields, "shift"))
        : undefined;

      const hasReadonly = readonlyValue !== undefined;
      const hasRecursive = recursiveValue !== undefined;
      const hasRequired = requiredValue !== undefined;
      const hasShift = shiftValue !== undefined;

      if (showMountPointField) {
        rows.push(
          getInheritedDeviceRow({
            label: "Mount point",
            inheritValue: item.disk.path,
            readOnly: readOnly,
            isDeactivated: isNoneDevice,
            disabledReason: formik.values.editRestriction,
            className:
              !hasReadonly && !hasRecursive && !hasRequired && !hasShift
                ? "device-last-row"
                : undefined,
          }),
        );
      }

      if (hasReadonly) {
        rows.push(
          getInheritedDeviceRow({
            label: labelWithHelpText("Read-only", "readonly"),
            inheritValue: readonlyValue,
            readOnly: readOnly,
            isDeactivated: isNoneDevice,
            disabledReason: formik.values.editRestriction,
            className:
              !hasRecursive && !hasRequired && !hasShift
                ? "device-last-row"
                : undefined,
          }),
        );
      }

      if (hasRecursive) {
        rows.push(
          getInheritedDeviceRow({
            label: labelWithHelpText("Recursive", "recursive"),
            inheritValue: recursiveValue,
            readOnly: readOnly,
            isDeactivated: isNoneDevice,
            disabledReason: formik.values.editRestriction,
            className:
              !hasRequired && !hasShift ? "device-last-row" : undefined,
          }),
        );
      }

      if (hasRequired) {
        rows.push(
          getInheritedDeviceRow({
            label: labelWithHelpText("Required", "required"),
            inheritValue: requiredValue,
            readOnly: readOnly,
            isDeactivated: isNoneDevice,
            disabledReason: formik.values.editRestriction,
            className: !hasShift ? "device-last-row" : undefined,
          }),
        );
      }

      if (hasShift) {
        rows.push(
          getInheritedDeviceRow({
            label: labelWithHelpText("Shift", "shift"),
            inheritValue: shiftValue,
            readOnly: readOnly,
            isDeactivated: isNoneDevice,
            disabledReason: formik.values.editRestriction,
            className: "device-last-row",
          }),
        );
      }
    }
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
