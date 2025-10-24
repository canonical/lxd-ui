import { Button, Icon } from "@canonical/react-components";
import type { FC } from "react";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { ensureEditMode } from "util/instanceEdit";
import {
  addNicDevice,
  addNoneDevice,
  focusNicDevice,
  removeNicDevice,
} from "util/formDevices";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { isNicDevice, isNoneDevice } from "util/devices";
import type { InheritedNetwork } from "util/configInheritance";

interface Props {
  readOnly: boolean;
  formik: InstanceAndProfileFormikProps;
  index: number;
  device?: LxdNicDevice | LxdNoneDevice;
  inheritedDevice?: InheritedNetwork;
}

const NetworkDeviceActionButtons: FC<Props> = ({
  readOnly,
  formik,
  index,
  device,
  inheritedDevice,
}: Props) => {
  const isPurelyInherited = inheritedDevice && !device;
  const hasNicOverride = inheritedDevice && device && isNicDevice(device);
  const hasNoneOverride = inheritedDevice && device && isNoneDevice(device);
  const isLocal = !inheritedDevice && device;

  const isDisabled = !!formik.values.editRestriction;

  const getEditTitle = () => {
    if (formik.values.editRestriction) return formik.values.editRestriction;
    if (isPurelyInherited || hasNoneOverride) return "Create override";
    if (hasNicOverride) return "Edit override";
    return "Edit network";
  };
  const editTitle = getEditTitle();

  const onEdit = () => {
    ensureEditMode(formik);
    if (isPurelyInherited || hasNoneOverride) {
      const newDeviceIndex = formik.values.devices.length;
      addNicDevice({
        formik,
        deviceName: inheritedDevice.key,
        deviceNetworkName: inheritedDevice.network?.network ?? "",
      });
      focusNicDevice(newDeviceIndex);
    } else {
      focusNicDevice(index);
    }
  };

  const clearOverride = () => {
    ensureEditMode(formik);
    removeNicDevice({ formik, deviceName: device?.name || "" });
  };

  const detachInherited = () => {
    ensureEditMode(formik);
    addNoneDevice(inheritedDevice?.key || "", formik);
  };

  const detachOverridden = () => {
    ensureEditMode(formik);
    addNoneDevice(device?.name || "", formik);
  };

  return (
    <div className="network-device-actions">
      {(readOnly || isPurelyInherited) && (
        <Button
          onClick={onEdit}
          type="button"
          appearance="base"
          title={editTitle}
          className="u-no-margin--top"
          hasIcon
          dense
          disabled={isDisabled}
        >
          <Icon name="edit" />
          <span>Edit</span>
        </Button>
      )}

      {isPurelyInherited && (
        <Button
          className="u-no-margin--top"
          onClick={detachInherited}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Detach network"}
          disabled={isDisabled}
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>
      )}

      {hasNicOverride && (
        <>
          <Button
            className="u-no-margin--top"
            onClick={clearOverride}
            type="button"
            appearance="base"
            hasIcon
            dense
            title={formik.values.editRestriction || "Clear override"}
            disabled={isDisabled}
          >
            <Icon name="close" />
            <span>Clear</span>
          </Button>
          <Button
            className="u-no-margin--top"
            onClick={detachInherited}
            type="button"
            appearance="base"
            hasIcon
            dense
            title={formik.values.editRestriction || "Detach network"}
            disabled={isDisabled}
          >
            <Icon name="disconnect" />
            <span>Detach</span>
          </Button>
        </>
      )}

      {hasNoneOverride && (
        <Button
          className="u-no-margin--top"
          onClick={clearOverride}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Reattach inherited network"}
          disabled={isDisabled}
        >
          <Icon name="connected" />
          <span>Reattach</span>
        </Button>
      )}

      {isLocal && (
        <Button
          className="u-no-margin--top"
          onClick={detachOverridden}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Detach network"}
          disabled={isDisabled}
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>
      )}
    </div>
  );
};

export default NetworkDeviceActionButtons;
