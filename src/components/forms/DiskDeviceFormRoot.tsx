import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { LxdDiskDevice } from "types/device";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ConfigurationTable from "components/ConfigurationTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { getInheritedRootStorage } from "util/configInheritance";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import { getInheritedDeviceRow } from "./InheritedDeviceRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import type { LxdStoragePool } from "types/storage";
import type { LxdProfile } from "types/profile";
import { removeDevice } from "util/formDevices";
import { hasNoRootDisk, isRootDisk } from "util/instanceValidation";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import DiskSizeQuotaLimitation from "components/forms/DiskSizeQuotaLimitation";

interface Props {
  formik: InstanceAndProfileFormikProps;
  pools: LxdStoragePool[];
  profiles: LxdProfile[];
}

const DiskDeviceFormRoot: FC<Props> = ({ formik, pools, profiles }) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const rootIndex = formik.values.devices.findIndex(isRootDisk);
  const hasRootStorage = rootIndex !== -1;
  const formRootDevice = formik.values.devices[
    rootIndex
  ] as LxdDiskDevice | null;
  const isEditingInstance =
    formik.values.entityType === "instance" && !formik.values.isCreating;
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
      name: inheritValue?.name ? inheritValue.name : "root",
      path: "/",
      pool: inheritValue ? inheritValue.pool : (pools[0]?.name ?? undefined),
    });
    formik.setFieldValue("devices", copy);
  };

  return (
    <>
      <h2 className="p-heading--4">Root storage</h2>
      <ConfigurationTable
        rows={[
          getConfigurationRowBase({
            className: "override-with-form",
            configuration: <b className="device-name">Root storage</b>,
            inherited: "",
            override: hasRootStorage ? (
              <div>
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
                >
                  <Icon name="close" className="clear-configuration-icon" />
                </Button>
              </div>
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
              </Button>
            ),
          }),

          getInheritedDeviceRow({
            label: "Pool",
            id: "storage-pool-selector-disk",
            className: "override-with-form",
            inheritValue: inheritValue?.pool ?? "",
            inheritSource,
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
            label: "Size",
            id: "limits_disk",
            className: "override-with-form",
            inheritValue:
              inheritValue?.size ?? (inheritValue ? defaultSize : ""),
            inheritSource,
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
