import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { LxdDiskDevice } from "types/device";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ConfigurationTable from "components/ConfigurationTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { getInheritedRootStorage } from "util/configInheritance";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import {
  getInheritedDeviceRow,
  getInheritedSourceRow,
} from "components/forms/InheritedDeviceRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import type { LxdStoragePool } from "types/storage";
import type { LxdProfile } from "types/profile";
import { removeDevice } from "util/formDevices";
import { hasNoRootDisk, isRootDisk } from "util/instanceValidation";
import { ensureEditMode, isInstanceCreation } from "util/instanceEdit";
import { focusField } from "util/formFields";
import DiskSizeQuotaLimitation from "components/forms/DiskSizeQuotaLimitation";
import { getProfileFromSource } from "util/devices";
import { isDeviceModified } from "util/formChangeCount";

interface Props {
  formik: InstanceAndProfileFormikProps;
  pools: LxdStoragePool[];
  profiles: LxdProfile[];
  project: string;
}

const DiskDeviceFormRoot: FC<Props> = ({
  formik,
  pools,
  profiles,
  project,
}) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const rootIndex = formik.values.devices.findIndex(isRootDisk);
  const hasRootStorage = rootIndex !== -1;
  const formRootDevice = formik.values.devices[
    rootIndex
  ] as LxdDiskDevice | null;
  const isEditingInstance =
    formik.values.entityType === "instance" && !isInstanceCreation(formik);
  const isVirtualMachine =
    formik.values.entityType === "instance" &&
    formik.values.instanceType === "virtual-machine";
  const defaultSize = isVirtualMachine ? "10GiB" : "unlimited";
  const poolDriver = pools.find(
    (item) => item.name === formRootDevice?.pool,
  )?.driver;

  const [inheritValue, inheritSource] = getInheritedRootStorage(
    formik.values,
    profiles,
  );

  const addRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "disk",
      name: inheritValue?.name ?? "root",
      path: "/",
      pool: inheritValue?.pool ?? pools[0]?.name,
    });
    formik.setFieldValue("devices", copy);
  };

  const rootDeviceName =
    formRootDevice?.name || (inheritValue?.name ? inheritValue.name : "root");
  const deviceModified = isDeviceModified(formik, rootDeviceName);
  const initialOverrideExists = formik.initialValues.devices.some(isRootDisk);
  const hasOverrideBeenRemoved = initialOverrideExists && !hasRootStorage;
  const hasChanges = deviceModified || hasOverrideBeenRemoved;

  return (
    <>
      <ConfigurationTable
        className="disk-device-root-configuration-table"
        rows={[
          getConfigurationRowBase({
            className: "override-with-form disk-device-root-header-row",
            configuration: (
              <div className="disk-device-root-header u-flex u-gap--small">
                <h2 className="p-heading--4 u-no-margin--bottom">
                  Root storage
                </h2>
                {hasChanges && (
                  <Icon
                    name="status-in-progress-small"
                    title="This device has unsaved changes"
                  />
                )}
              </div>
            ),
            inherited: "",
            override: (
              <div>
                {hasRootStorage ? (
                  <Button
                    onClick={() => {
                      ensureEditMode(formik);
                      removeDevice(rootIndex, formik);
                    }}
                    type="button"
                    appearance="base"
                    title={formik.values.editRestriction ?? "Clear override"}
                    hasIcon
                    className="u-no-margin--bottom"
                    disabled={!!formik.values.editRestriction}
                    dense
                  >
                    <Icon name="close" className="clear-configuration-icon" />
                    <span>Clear</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      ensureEditMode(formik);
                      addRootStorage();
                    }}
                    type="button"
                    appearance="base"
                    title={formik.values.editRestriction ?? "Create override"}
                    className="u-no-margin--bottom"
                    hasIcon
                    disabled={!!formik.values.editRestriction}
                  >
                    <Icon name="edit" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            ),
          }),

          ...(inheritSource && inheritSource !== "LXD"
            ? [
                getInheritedSourceRow({
                  project,
                  profile: getProfileFromSource(inheritSource),
                  hasLocalOverride: hasRootStorage,
                  className: "has-margin-left",
                }),
              ]
            : []),

          getInheritedDeviceRow({
            mutedLabel: true,
            label: "Pool",
            id: "storage-pool-selector-disk",
            className: "override-with-form has-margin-left",
            inheritValue: inheritValue?.pool ?? "",
            readOnly: readOnly,
            disabledReason: formik.values.editRestriction,
            overrideValue: hasRootStorage && (
              <>
                {formRootDevice?.pool}
                {formik.values.entityType === "profile" && (
                  <Button
                    onClick={() => {
                      ensureEditMode(formik);
                      focusField("storage-pool-selector");
                    }}
                    type="button"
                    appearance="base"
                    title={formik.values.editRestriction ?? "Edit"}
                    className="u-no-margin--bottom"
                    hasIcon
                    disabled={!!formik.values.editRestriction}
                  >
                    <Icon name="edit" />
                  </Button>
                )}
              </>
            ),
            overrideForm: (
              <>
                <StoragePoolSelector
                  value={formRootDevice?.pool ?? ""}
                  setValue={(value) =>
                    void formik.setFieldValue(
                      `devices.${rootIndex}.pool`,
                      value,
                    )
                  }
                  selectProps={{
                    id: "storage-pool-selector-disk",
                    className: isEditingInstance ? "" : "u-no-margin--bottom",
                    disabled: isEditingInstance,
                    help: isEditingInstance
                      ? "Use the migrate button in the header to change root storage."
                      : "",
                  }}
                />
              </>
            ),
          }),

          getInheritedDeviceRow({
            mutedLabel: true,
            label: "Size",
            id: "limits_disk",
            className: "override-with-form has-margin-left",
            inheritValue:
              inheritValue?.size ?? (inheritValue ? defaultSize : ""),
            readOnly: readOnly,
            disabledReason: formik.values.editRestriction,
            overrideValue: hasRootStorage && (
              <>
                {formRootDevice?.size ?? "unlimited"}
                <Button
                  onClick={() => {
                    ensureEditMode(formik);
                    focusField("limits_disk");
                  }}
                  type="button"
                  appearance="base"
                  title={formik.values.editRestriction ?? "Edit"}
                  className="u-no-margin--bottom"
                  hasIcon
                  disabled={!!formik.values.editRestriction}
                >
                  <Icon name="edit" />
                </Button>
              </>
            ),
            overrideForm: hasRootStorage && (
              <>
                <DiskSizeSelector
                  value={formRootDevice?.size ?? "GiB"}
                  setMemoryLimit={(val?: string) =>
                    void formik.setFieldValue(`devices.${rootIndex}.size`, val)
                  }
                />
                <p className="p-form-help-text">
                  <DiskSizeQuotaLimitation driver={poolDriver} />
                  Size of root storage. If empty, root storage will{" "}
                  {isVirtualMachine ? "be 10GiB." : "not have a size limit."}
                </p>
              </>
            ),
          }),
        ]}
      />
      {hasNoRootDisk(formik.values, profiles) && (
        <div className="is-error ">
          <p className="p-form-validation__message">
            <strong>Error:</strong> Missing root storage. Create an override, or
            add a profile with root storage.
          </p>
        </div>
      )}
    </>
  );
};

export default DiskDeviceFormRoot;
