import { FC } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import CustomVolumeSelectBtn from "pages/storage/CustomVolumeSelectBtn";
import {
  deduplicateName,
  FormDiskDevice,
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
import { getExistingDeviceNames } from "util/devices";
import { LxdProfile } from "types/profile";
import { focusField } from "util/formFields";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  profiles: LxdProfile[];
}

const DiskDeviceFormCustom: FC<Props> = ({ formik, project, profiles }) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const customVolumes = formik.values.devices
    .filter((item) => item.type === "disk" && !isRootDisk(item))
    .map((device) => device as FormDiskDevice);

  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);

  const addVolume = (volume: LxdStorageVolume) => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "disk",
      name: deduplicateName("volume", 1, existingDeviceNames),
      path: volume.content_type === "filesystem" ? "" : undefined,
      pool: volume.pool,
      source: volume.name,
    });
    void formik.setFieldValue("devices", copy);

    const name = `devices.${copy.length - 1}.path`;
    focusField(name);
  };

  const changeVolume = (
    volume: LxdStorageVolume,
    formVolume: FormDiskDevice,
    index: number,
  ) => {
    void formik.setFieldValue(`devices.${index}.pool`, volume.pool);
    void formik.setFieldValue(`devices.${index}.source`, volume.name);
    if (volume.content_type === "filesystem" && formVolume.path === undefined) {
      void formik.setFieldValue(`devices.${index}.path`, "");
    }
    if (volume.content_type === "block") {
      void formik.setFieldValue(`devices.${index}.path`, undefined);
    }
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
  customVolumes.map((formVolume) => {
    const index = formik.values.devices.indexOf(formVolume);

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top custom-device-name",
        configuration: (
          <RenameDeviceInput
            name={formVolume.name}
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

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top inherited-with-form",
        configuration: (
          <Label forId={`devices.${index}.pool`}>Pool / volume</Label>
        ),
        inherited: (
          <div className="custom-disk-volume-source">
            <div
              className={classnames("mono-font", "u-truncate")}
              title={`${formVolume.pool} / ${formVolume.source ?? ""}`}
            >
              <b>
                {formVolume.pool} / {formVolume.source}
              </b>
            </div>
            <CustomVolumeSelectBtn
              formik={formik}
              project={project}
              setValue={(volume) => {
                ensureEditMode(formik);
                changeVolume(volume, formVolume, index);
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
      }),
    );

    if (formVolume.path !== undefined) {
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
                <b>{formVolume.path}</b>
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
              value={formVolume.path}
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
  });

  return (
    <div className="custom-devices">
      {customVolumes.length > 0 && (
        <>
          <h2 className="p-heading--4 custom-devices-heading">
            Custom disk devices
          </h2>
          <ConfigurationTable rows={rows} />
        </>
      )}
      <CustomVolumeSelectBtn
        formik={formik}
        project={project}
        setValue={(volume) => {
          ensureEditMode(formik);
          addVolume(volume);
        }}
      >
        <Icon name="plus" />
        <span>Attach disk device</span>
      </CustomVolumeSelectBtn>
    </div>
  );
};

export default DiskDeviceFormCustom;
