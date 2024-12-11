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
import { LxdStorageVolume } from "types/storage";
import {
  isDiskDeviceMountPointMissing,
  isRootDisk,
} from "util/instanceValidation";
import { ensureEditMode } from "util/instanceEdit";
import { getExistingDeviceNames, isVolumeDevice } from "util/devices";
import { LxdProfile } from "types/profile";
import { focusField } from "util/formFields";
import AttachDiskDeviceBtn from "pages/storage/AttachDiskDeviceBtn";
import { LxdDiskDevice } from "types/device";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  profiles: LxdProfile[];
}

const DiskDeviceFormCustom: FC<Props> = ({ formik, project, profiles }) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);

  const addDiskDevice = (device: LxdStorageVolume | LxdDiskDevice) => {
    const copy = [...formik.values.devices];
    const isVolume = "content_type" in device;
    const newDevice: FormDevice = {
      type: "disk",
      name: deduplicateName("disk-device", 1, existingDeviceNames),
    };

    if (isVolume) {
      newDevice.pool = device.pool;
      newDevice.source = device.name;
      newDevice.path = device.content_type === "filesystem" ? "" : undefined;
    } else {
      newDevice.source = device.source;
      newDevice.path = device.path;
    }

    copy.push(newDevice);
    void formik.setFieldValue("devices", copy);

    const name = `devices.${copy.length - 1}.path`;
    focusField(name);
  };

  const changeDiskDevice = (
    diskDevice: LxdStorageVolume | LxdDiskDevice,
    formDiskDevice: FormDiskDevice,
    index: number,
  ) => {
    const isVolume = "content_type" in diskDevice;
    if (isVolume) {
      void formik.setFieldValue(`devices.${index}.pool`, diskDevice.pool);
      void formik.setFieldValue(`devices.${index}.source`, diskDevice.name);

      if (
        diskDevice.content_type === "filesystem" &&
        formDiskDevice.path === undefined
      ) {
        void formik.setFieldValue(`devices.${index}.path`, "");
      }
      if (diskDevice.content_type === "block") {
        void formik.setFieldValue(`devices.${index}.path`, undefined);
      }

      return;
    }

    void formik.setFieldValue(`devices.${index}.source`, diskDevice.source);
    void formik.setFieldValue(`devices.${index}.path`, diskDevice.path);
  };

  const editButton = (fieldName: string) => (
    <Button
      appearance="base"
      className="u-no-margin--bottom"
      hasIcon
      dense
      title="Edit"
      onClick={() => {
        ensureEditMode(formik);
        focusField(fieldName);
      }}
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
              void formik.setFieldValue(`devices.${index}.name`, name);
            }}
          />
        ),
        inherited: "",
        override: (
          <DetachDiskDeviceBtn
            onDetach={() => {
              ensureEditMode(formik);
              removeDevice(index, formik);
            }}
          />
        ),
      }),
    );

    const volumeDeviceSource = getConfigurationRowBase({
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
              changeDiskDevice(volume, item, index);
            }}
            buttonProps={{
              id: `devices.${index}.pool`,
              appearance: "base",
              className: "u-no-margin--bottom",
              title: "Select storage volume",
              dense: true,
            }}
          >
            <Icon name="edit" />
          </CustomVolumeSelectBtn>
        </div>
      ),
      override: "",
    });

    const hostDeviceSource = getConfigurationRowBase({
      className: "no-border-top inherited-with-form",
      configuration: <Label forId={`devices.${index}.source`}>Host path</Label>,
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
            void formik.setFieldValue(
              `devices.${index}.source`,
              e.target.value,
            );
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

    rows.push(isVolumeDevice(item) ? volumeDeviceSource : hostDeviceSource);

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
                void formik.setFieldValue(
                  `devices.${index}.path`,
                  e.target.value,
                );
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
