import { FC } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import CustomVolumeSelectBtn from "pages/storage/CustomVolumeSelectBtn";
import {
  deduplicateName,
  FormDevice,
  FormDiskDevice,
  isFormDiskDevice,
  removeDevice,
} from "util/formDevices";
import RenameDeviceInput from "./RenameDeviceInput";
import ConfigurationTable from "components/ConfigurationTable";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";
import classnames from "classnames";
import {
  isDiskDeviceMountPointMissing,
  isRootDisk,
} from "util/instanceValidation";
import { ensureEditMode } from "util/instanceEdit";
import { getExistingDeviceNames, isVolumeDevice } from "util/devices";
import type { LxdProfile } from "types/profile";
import { focusField } from "util/formFields";
import AttachDiskDeviceBtn from "pages/storage/AttachDiskDeviceBtn";
import type { LxdDiskDevice } from "types/device";
import type { LxdStorageVolume } from "types/storage";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  profiles: LxdProfile[];
}

const DiskDeviceFormCustom: FC<Props> = ({ formik, project, profiles }) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);

  const addDiskDevice = (device: LxdDiskDevice) => {
    const copy = [...formik.values.devices];
    const newDevice: FormDevice = {
      ...device,
      name: deduplicateName("disk-device", 1, existingDeviceNames),
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

    // If path must not exist for the device, remote it even if it's set for the existing device
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

  const rows: MainTableRow[] = [];
  let customDiskDeviceCount = 0;
  for (let index = 0; index < formik.values.devices.length; index++) {
    const item = formik.values.devices[index];
    if (!isFormDiskDevice(item) || isRootDisk(item)) {
      continue;
    }

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top custom-device-name",
        configuration: (
          <RenameDeviceInput
            name={item.name}
            index={index}
            setName={(name) => {
              ensureEditMode(formik);
              formik.setFieldValue(`devices.${index}.name`, name);
            }}
            disableReason={formik.values.editRestriction}
          />
        ),
        inherited: "",
        override: (
          <DetachDiskDeviceBtn
            onDetach={() => {
              ensureEditMode(formik);
              removeDevice(index, formik);
            }}
            disabledReason={formik.values.editRestriction}
          />
        ),
      }),
    );

    const volumeDeviceSource = () =>
      getConfigurationRowBase({
        className: "no-border-top inherited-with-form",
        configuration: (
          <Label forId={`devices.${index}.pool`}>Pool / volume</Label>
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
                title: formik.values.editRestriction ?? "Select storage volume",
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
        className: "no-border-top inherited-with-form",
        configuration: (
          <Label forId={`devices.${index}.source`}>Host path</Label>
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

    rows.push(isVolumeDevice(item) ? volumeDeviceSource() : hostDeviceSource());

    if (!isVolumeDevice(item) || item.path !== undefined) {
      const hasError = isDiskDeviceMountPointMissing(formik, index);
      rows.push(
        getConfigurationRowBase({
          className: "no-border-top inherited-with-form",
          configuration: (
            <Label forId={`devices.${index}.path`} required>
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

    customDiskDeviceCount++;
  }

  return (
    <div className="custom-devices">
      {customDiskDeviceCount > 0 && (
        <>
          <h2 className="p-heading--4 custom-devices-heading">
            Custom disk devices
          </h2>
          <ConfigurationTable rows={rows} />
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
