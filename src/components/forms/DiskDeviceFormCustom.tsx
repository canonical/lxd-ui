import { FC } from "react";
import { Icon, Input, Label } from "@canonical/react-components";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { InheritedVolume } from "util/configInheritance";
import CustomVolumeSelectBtn from "pages/storage/CustomVolumeSelectBtn";
import { FormDiskDevice, removeDevice } from "util/formDevices";
import RenameDiskDeviceInput from "./RenameDiskDeviceInput";
import ConfigurationTable from "components/ConfigurationTable";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";
import classnames from "classnames";
import { LxdStorageVolume } from "types/storage";
import { isDiskDeviceMountPointMissing } from "util/instanceValidation";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  inheritedVolumes: InheritedVolume[];
}

const DiskDeviceFormCustom: FC<Props> = ({
  formik,
  project,
  inheritedVolumes,
}) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const customVolumes = formik.values.devices
    .filter((device) => device.name !== "root" && device.type === "disk")
    .map((device) => device as FormDiskDevice);

  const addVolume = (volume: LxdStorageVolume) => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "disk",
      name: deduplicateName(1),
      path: volume.content_type === "filesystem" ? "" : undefined,
      pool: volume.pool,
      source: volume.name,
    });
    void formik.setFieldValue("devices", copy);

    const name = `devices.${copy.length - 1}.path`;
    setTimeout(() => document.getElementById(name)?.focus(), 100);
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

  const deduplicateName = (index: number): string => {
    const candidate = `volume-${index}`;
    const hasConflict =
      formik.values.devices.some((item) => item.name === candidate) ||
      inheritedVolumes.some((item) => item.key === candidate);
    if (hasConflict) {
      return deduplicateName(index + 1);
    }
    return candidate;
  };

  const rows: MainTableRow[] = [];

  customVolumes.map((formVolume) => {
    const index = formik.values.devices.indexOf(formVolume);

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top custom-disk-device-name",
        configuration: (
          <RenameDiskDeviceInput
            name={formVolume.name}
            index={index}
            readOnly={readOnly}
            setName={(name) =>
              void formik.setFieldValue(`devices.${index}.name`, name)
            }
          />
        ),
        inherited: "",
        override: !readOnly && (
          <DetachDiskDeviceBtn onDetach={() => removeDevice(index, formik)} />
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
              className={classnames("mono-font", {
                "u-truncate": !formik.values.readOnly,
              })}
              title={
                formik.values.readOnly
                  ? undefined
                  : `${formVolume.pool} / ${formVolume.source ?? ""}`
              }
            >
              <b>
                {formVolume.pool} / {formVolume.source}
              </b>
            </div>
            {!readOnly && (
              <CustomVolumeSelectBtn
                project={project}
                setValue={(volume) => changeVolume(volume, formVolume, index)}
                buttonProps={{
                  id: `devices.${index}.pool`,
                  appearance: "base",
                  className: "u-no-margin--bottom",
                  "aria-label": `Select storage volume`,
                }}
              >
                <Icon name="edit" />
              </CustomVolumeSelectBtn>
            )}
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
            <div className="mono-font">
              <b>{formVolume.path}</b>
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

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top inherited-with-form",
        configuration: (
          <Label forId={`devices.${index}.limits.read`}>Read limit</Label>
        ),
        inherited: readOnly ? (
          <div className="mono-font">
            <b>
              {formVolume.limits?.read
                ? `${formVolume.limits.read} IOPS`
                : "none"}
            </b>
          </div>
        ) : (
          <div className="custom-disk-device-limits">
            <Input
              id={`devices.${index}.limits.read`}
              name={`devices.${index}.limits.read`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                void formik.setFieldValue(
                  `devices.${index}.limits.read`,
                  e.target.value,
                );
              }}
              value={formVolume.limits?.read}
              type="number"
              placeholder="Enter number"
              className="u-no-margin--bottom"
            />
            <div>IOPS</div>
          </div>
        ),
        override: "",
      }),
    );

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top inherited-with-form",
        configuration: (
          <Label forId={`devices.${index}.limits.write`}>Write limit</Label>
        ),
        inherited: readOnly ? (
          <div className="mono-font">
            <b>
              {formVolume.limits?.write
                ? `${formVolume.limits.write} IOPS`
                : "none"}
            </b>
          </div>
        ) : (
          <div className="custom-disk-device-limits">
            <Input
              id={`devices.${index}.limits.write`}
              name={`devices.${index}.limits.write`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                void formik.setFieldValue(
                  `devices.${index}.limits.write`,
                  e.target.value,
                );
              }}
              value={formVolume.limits?.write}
              type="number"
              placeholder="Enter number"
              className="u-no-margin--bottom"
            />
            <div>IOPS</div>
          </div>
        ),
        override: "",
      }),
    );
  });

  return (
    <div className="custom-disk-devices">
      {customVolumes.length > 0 && (
        <>
          <h2 className="p-heading--4 custom-disk-devices-heading">
            Custom devices
          </h2>
          <ConfigurationTable rows={rows} />
        </>
      )}
      {!readOnly && (
        <CustomVolumeSelectBtn project={project} setValue={addVolume}>
          <Icon name="plus" />
          <span>Attach disk device</span>
        </CustomVolumeSelectBtn>
      )}
    </div>
  );
};

export default DiskDeviceFormCustom;
