import type { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
} from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type {
  CreateInstanceFormValues,
  EditInstanceFormValues,
} from "types/forms/instanceAndProfile";
import CustomVolumeSelectBtn from "pages/storage/CustomVolumeSelectBtn";
import type {
  CustomDiskDevice,
  FormDevice,
  FormDiskDevice,
  IsoVolumeDevice,
} from "types/formDevice";
import {
  deduplicateName,
  isFormDiskDevice,
  removeDevice,
} from "util/formDevices";
import DeviceName from "components/forms/DeviceName";
import RenameDeviceInput from "components/forms/RenameDeviceInput";
import ConfigurationTable from "components/ConfigurationTable";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";
import classnames from "classnames";
import { isDiskDeviceMountPointMissing } from "util/instanceValidation";
import {
  getExistingDeviceNames,
  isIsoDiskDevice,
  ISO_VOLUME_NAME,
  ISO_VOLUME_PROFILE_NAME,
  ISO_VOLUME_TYPE,
  isRootDisk,
  isVolumeDevice,
} from "util/devices";
import { isInstanceCreation } from "util/instanceEdit";
import { ensureEditMode } from "util/editMode";
import { focusField, optionRenderer } from "util/formFields";
import AttachDiskDeviceBtn from "pages/storage/AttachDiskDeviceBtn";
import type { LxdProfile } from "types/profile";
import type { LxdStorageVolume } from "types/storage";
import StoragePoolRichChip from "pages/storage/StoragePoolRichChip";
import { optionYesNo } from "util/options";
import {
  getConfigFieldDefault,
  getConfigFieldDescription,
  toConfigFields,
} from "util/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { useConfigOptions } from "context/useConfigOptions";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  profiles: LxdProfile[];
}

const DiskDeviceFormCustom: FC<Props> = ({ formik, project, profiles }) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);
  const isProfile = formik.values.entityType === "profile";
  const { data: configOptions } = useConfigOptions();

  const diskOptions = configOptions?.configs?.["device-disk"];
  const diskConfigFields = diskOptions ? toConfigFields(diskOptions) : [];

  const diskFieldLabel = ({
    id,
    label,
    key,
    required = false,
  }: {
    id: string;
    label: string;
    key: string;
    required?: boolean;
  }) => (
    <div className="configuration-label-with-help">
      <Label forId={id} required={required}>
        {label}
      </Label>
      <span className="configuration-help">
        <ConfigFieldDescription
          description={getConfigFieldDescription(diskConfigFields, key)}
        />
      </span>
    </div>
  );

  const getInitialDeviceName = (
    deviceType: string,
    isProfile: boolean,
  ): string => {
    if (deviceType === ISO_VOLUME_TYPE) {
      return isProfile ? ISO_VOLUME_PROFILE_NAME : ISO_VOLUME_NAME;
    }
    return deduplicateName("disk-device", 1, existingDeviceNames);
  };

  const addDiskDevice = (device: CustomDiskDevice) => {
    const copy = [...formik.values.devices];
    const newDevice: FormDevice = {
      ...device,
      name: getInitialDeviceName(device.type, isProfile),
    };

    copy.push(newDevice);
    formik.setFieldValue("devices", copy);

    const name = `devices.${copy.length - 1}.path`;
    focusField(name);
  };

  const changeVolume = (
    volume: LxdStorageVolume,
    existingVolume: FormDiskDevice,
    index: number,
  ) => {
    formik.setFieldValue(`devices.${index}.pool`, volume.pool);
    formik.setFieldValue(`devices.${index}.source`, volume.name);

    if (
      volume.content_type === "filesystem" &&
      existingVolume.path === undefined
    ) {
      formik.setFieldValue(`devices.${index}.path`, "");
    }

    // If path must not exist for the device, remove it even if it's set for the existing device
    if (volume.content_type === "block") {
      formik.setFieldValue(`devices.${index}.path`, undefined);
    }
  };

  const editButton = (fieldName: string) => (
    <Button
      appearance="base"
      className="u-no-margin--bottom"
      hasIcon
      dense
      title={formik.values.editRestriction ?? "Edit"}
      onClick={() => {
        ensureEditMode(formik);
        focusField(fieldName);
      }}
      disabled={!!formik.values.editRestriction}
    >
      <Icon name="edit" />
    </Button>
  );

  const readOnlyYesNoValue = (
    fieldName: string,
    value: string | undefined,
    option: string,
  ) => {
    const displayValue =
      value ?? getConfigFieldDefault(diskConfigFields, option);

    return (
      <div className="custom-disk-read-mode">
        <div className="custom-disk-value">
          <b>{optionRenderer(displayValue, optionYesNo) || "-"}</b>
        </div>
        {editButton(fieldName)}
      </div>
    );
  };

  const getYesNoOptionsWithLxdDefault = (fieldKey: string) => {
    const defaultValue = getConfigFieldDefault(diskConfigFields, fieldKey);
    const defaultLabel = optionRenderer(defaultValue, optionYesNo);
    const placeholderLabel = defaultLabel
      ? `LXD default (${defaultLabel})`
      : "LXD default";

    return optionYesNo.map((option, index) =>
      index === 0
        ? {
            ...option,
            label: placeholderLabel,
          }
        : option,
    );
  };

  const rows: MainTableRow[] = [];
  let customDiskDeviceCount = 0;
  for (let index = 0; index < formik.values.devices.length; index++) {
    const item = formik.values.devices[index];
    const isCustomDisk = isFormDiskDevice(item) || isIsoDiskDevice(item);

    if (!isCustomDisk || isRootDisk(item)) {
      continue;
    }

    if (isIsoDiskDevice(item)) {
      const hasBeenAdded = !formik.initialValues.devices.some(
        (t) => t.name === item.name,
      );

      rows.push(
        getConfigurationRowBase({
          className: "device-first-row",
          configuration: (
            <DeviceName name={item.name} hasChanges={hasBeenAdded} />
          ),
          inherited: null,
          override: (
            <div>
              <DetachDiskDeviceBtn
                onDetach={() => {
                  ensureEditMode(formik);
                  removeDevice(index, formik);
                }}
                disabledReason={formik.values.editRestriction}
                isInstanceCreation={isInstanceCreation(formik)}
              />
            </div>
          ),
        }),
      );
      rows.push(
        getConfigurationRowBase({
          className: "no-border-top has-margin-left",
          configuration: <div>Source</div>,
          inherited: (
            <b className="mono-font">{(item as IsoVolumeDevice).source}</b>
          ),
          override: null,
        }),
      );
      rows.push(
        getConfigurationRowBase({
          className: "no-border-top has-margin-left",
          configuration: <div>Pool</div>,
          inherited: (
            <StoragePoolRichChip
              poolName={(item as IsoVolumeDevice).pool}
              projectName={project}
            />
          ),
          override: null,
        }),
      );
    } else {
      if (!isFormDiskDevice(item)) {
        continue;
      }

      rows.push(
        getConfigurationRowBase({
          className: "custom-device-name device-first-row",
          configuration: (
            <RenameDeviceInput
              name={item.name}
              index={index}
              setName={(name) => {
                ensureEditMode(formik);
                formik.setFieldValue(`devices.${index}.name`, name);
              }}
              disableReason={formik.values.editRestriction}
              formik={formik}
            />
          ),
          inherited: "",
          override: (
            <div>
              <DetachDiskDeviceBtn
                onDetach={() => {
                  ensureEditMode(formik);
                  removeDevice(index, formik);
                }}
                disabledReason={formik.values.editRestriction}
                isInstanceCreation={isInstanceCreation(formik)}
              />
            </div>
          ),
        }),
      );

      const volumeDeviceSource = () =>
        getConfigurationRowBase({
          className: classnames("no-border-top inherited-with-form"),
          configuration: (
            <Label forId={`devices.${index}.pool`} className="u-text--muted">
              Pool / volume
            </Label>
          ),
          inherited: (
            <div className="custom-disk-volume-source">
              <div
                className={classnames("mono-font", "u-truncate")}
                title={`${item.pool} / ${item.source ?? ""}`}
              >
                <b>
                  {item.pool} / {item.source}
                </b>
              </div>
              <CustomVolumeSelectBtn
                formik={formik}
                project={project}
                setValue={(volume) => {
                  ensureEditMode(formik);
                  changeVolume(volume, item, index);
                }}
                buttonProps={{
                  id: `devices.${index}.pool`,
                  appearance: "base",
                  className: "u-no-margin--bottom",
                  title:
                    formik.values.editRestriction ?? "Select storage volume",
                  dense: true,
                  disabled: !!formik.values.editRestriction,
                }}
              >
                <Icon name="edit" />
              </CustomVolumeSelectBtn>
            </div>
          ),
          override: "",
        });

      const hostDeviceSource = () =>
        getConfigurationRowBase({
          className: classnames("no-border-top inherited-with-form"),
          configuration: (
            <Label forId={`devices.${index}.source`} className="u-text--muted">
              Host path
            </Label>
          ),
          inherited: readOnly ? (
            <div className="custom-disk-read-mode">
              <div className="mono-font custom-disk-value u-truncate">
                <b>{item.source}</b>
              </div>
              {editButton(`devices.${index}.source`)}
            </div>
          ) : (
            <Input
              id={`devices.${index}.source`}
              name={`devices.${index}.source`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                formik.setFieldValue(`devices.${index}.source`, e.target.value);
              }}
              value={item.source}
              type="text"
              placeholder="Enter full host path (e.g. /data)"
              className={!item.source ? undefined : "u-no-margin--bottom"}
              error={!item.source ? "Host path is required" : undefined}
            />
          ),
          override: "",
        });

      const isContainerOrProfile =
        isProfile ||
        (formik.values as CreateInstanceFormValues).instanceType ===
          "container";
      const isVolumeBackedDisk = isVolumeDevice(item);
      const isReadonlyDisk = item.readonly === "true";
      const isRecursiveDisk = item.recursive === "true";
      const showMountPointField =
        !isVolumeBackedDisk || item.path !== undefined;
      const showRecursiveField = !isVolumeBackedDisk;
      const showShiftField = isContainerOrProfile && !isVolumeBackedDisk;
      const isRequiredLastRow = !showShiftField;

      rows.push(
        isVolumeDevice(item) ? volumeDeviceSource() : hostDeviceSource(),
      );

      if (showMountPointField) {
        const hasError = isDiskDeviceMountPointMissing(formik, index);
        rows.push(
          getConfigurationRowBase({
            className: "no-border-top inherited-with-form",
            configuration: (
              <Label
                forId={`devices.${index}.path`}
                className="u-text--muted"
                required
              >
                Mount point
              </Label>
            ),
            inherited: readOnly ? (
              <div className="custom-disk-read-mode">
                <div className="mono-font custom-disk-value">
                  <b>{item.path}</b>
                </div>
                {editButton(`devices.${index}.path`)}
              </div>
            ) : (
              <Input
                id={`devices.${index}.path`}
                name={`devices.${index}.path`}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.setFieldValue(`devices.${index}.path`, e.target.value);
                }}
                value={item.path}
                type="text"
                placeholder="Enter full path (e.g. /data)"
                className={hasError ? undefined : "u-no-margin--bottom"}
                error={hasError ? "Path is required" : undefined}
              />
            ),
            override: "",
          }),
        );
      }

      rows.push(
        getConfigurationRowBase({
          className: "no-border-top inherited-with-form",
          configuration: diskFieldLabel({
            id: `devices.${index}.readonly`,
            label: "Read-only",
            key: "readonly",
          }),
          inherited: readOnly ? (
            readOnlyYesNoValue(
              `devices.${index}.readonly`,
              item.readonly,
              "readonly",
            )
          ) : (
            <Select
              id={`devices.${index}.readonly`}
              name={`devices.${index}.readonly`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                ensureEditMode(formik);
                const value = e.target.value || undefined;
                formik.setFieldValue(`devices.${index}.readonly`, value);

                // The kernel does not support recursive read-only bind mounts.
                if (value === "true") {
                  formik.setFieldValue(`devices.${index}.recursive`, undefined);
                }
              }}
              value={item.readonly ?? ""}
              options={getYesNoOptionsWithLxdDefault("readonly")}
              className="u-no-margin--bottom"
              disabled={!!formik.values.editRestriction || isRecursiveDisk}
              title={
                formik.values.editRestriction ??
                (isRecursiveDisk
                  ? "Cannot set read-only with recursive bind mounts"
                  : undefined)
              }
            />
          ),
          override: "",
        }),
      );

      if (showRecursiveField) {
        rows.push(
          getConfigurationRowBase({
            className: "no-border-top inherited-with-form",
            configuration: diskFieldLabel({
              id: `devices.${index}.recursive`,
              label: "Recursive",
              key: "recursive",
            }),
            inherited: readOnly ? (
              readOnlyYesNoValue(
                `devices.${index}.recursive`,
                item.recursive,
                "recursive",
              )
            ) : (
              <Select
                id={`devices.${index}.recursive`}
                name={`devices.${index}.recursive`}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  ensureEditMode(formik);
                  const value = e.target.value || undefined;
                  formik.setFieldValue(`devices.${index}.recursive`, value);

                  // The kernel does not support recursive read-only bind mounts.
                  if (value === "true") {
                    formik.setFieldValue(
                      `devices.${index}.readonly`,
                      undefined,
                    );
                  }
                }}
                value={item.recursive ?? ""}
                options={getYesNoOptionsWithLxdDefault("recursive")}
                className="u-no-margin--bottom"
                disabled={!!formik.values.editRestriction || isReadonlyDisk}
                title={
                  formik.values.editRestriction ??
                  (isReadonlyDisk
                    ? "Recursive read-only bind mounts are not supported"
                    : undefined)
                }
              />
            ),
            override: "",
          }),
        );
      }

      rows.push(
        getConfigurationRowBase({
          className: classnames("no-border-top inherited-with-form", {
            "device-last-row": isRequiredLastRow,
          }),
          configuration: diskFieldLabel({
            id: `devices.${index}.required`,
            label: "Required",
            key: "required",
          }),
          inherited: readOnly ? (
            readOnlyYesNoValue(
              `devices.${index}.required`,
              item.required,
              "required",
            )
          ) : (
            <Select
              id={`devices.${index}.required`}
              name={`devices.${index}.required`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  `devices.${index}.required`,
                  e.target.value || undefined,
                );
              }}
              value={item.required ?? ""}
              options={getYesNoOptionsWithLxdDefault("required")}
              className="u-no-margin--bottom"
              disabled={!!formik.values.editRestriction}
              title={formik.values.editRestriction}
            />
          ),
          override: "",
        }),
      );

      // The "shift" property cannot be used with custom storage volumes or VMs
      if (showShiftField) {
        rows.push(
          getConfigurationRowBase({
            className: "no-border-top inherited-with-form device-last-row",
            configuration: diskFieldLabel({
              id: `devices.${index}.shift`,
              label: "Shift",
              key: "shift",
            }),
            inherited: readOnly ? (
              readOnlyYesNoValue(`devices.${index}.shift`, item.shift, "shift")
            ) : (
              <Select
                id={`devices.${index}.shift`}
                name={`devices.${index}.shift`}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.setFieldValue(
                    `devices.${index}.shift`,
                    e.target.value || undefined,
                  );
                }}
                value={item.shift ?? ""}
                options={getYesNoOptionsWithLxdDefault("shift")}
                className="u-no-margin--bottom"
                disabled={!!formik.values.editRestriction}
                title={formik.values.editRestriction}
              />
            ),
            override: "",
          }),
        );
      }
    }

    customDiskDeviceCount++;
  }

  return (
    <div className="custom-devices">
      {customDiskDeviceCount > 0 && (
        <>
          <h2 className="p-heading--4">Custom disk devices</h2>
          <ConfigurationTable
            rows={rows}
            className="custom-disk-device-configuration-table"
          />
        </>
      )}
      <AttachDiskDeviceBtn
        formik={formik}
        project={project}
        setValue={(device) => {
          ensureEditMode(formik);
          addDiskDevice(device);
        }}
      >
        <Icon name="plus" />
        <span>Attach disk device</span>
      </AttachDiskDeviceBtn>
    </div>
  );
};

export default DiskDeviceFormCustom;
