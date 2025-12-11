import { Button, Icon } from "@canonical/react-components";
import { type FC } from "react";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { ensureEditMode } from "util/instanceEdit";
import { addNoneDevice, removeNicDevice } from "util/formDevices";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { isNicDevice, isNoneDevice } from "util/devices";
import type { InheritedNetwork } from "util/configInheritance";
import usePanelParams from "util/usePanelParams";

interface Props {
  formik: InstanceAndProfileFormikProps;
  device?: LxdNicDevice | LxdNoneDevice;
  inheritedDevice?: InheritedNetwork;
}

const NetworkDeviceActionButtons: FC<Props> = ({
  formik,
  device,
  inheritedDevice,
}: Props) => {
  const panelParams = usePanelParams();

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
    if (isPurelyInherited || hasNoneOverride) {
      panelParams.openEditNetworkDevice(inheritedDevice.key);
    } else if (device && isNicDevice(device)) {
      panelParams.openEditNetworkDevice(device.name || "");
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
    removeNicDevice({ formik, deviceName: device?.name || "" });
  };

  const getActionButtons = () => {
    const buttons = [];

    if (isPurelyInherited || isLocal || hasNicOverride) {
      buttons.push(
        <Button
          onClick={onEdit}
          type="button"
          appearance="base"
          title={editTitle}
          className="p-segmented-control__button p-action-button p-button"
          hasIcon
          dense
          disabled={isDisabled}
          key="edit-button"
        >
          <Icon name="edit" />
          <span>Edit</span>
        </Button>,
      );
    }

    if (isPurelyInherited) {
      buttons.push(
        <Button
          className="p-segmented-control__button p-action-button p-button"
          onClick={detachInherited}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Detach network"}
          disabled={isDisabled}
          key="detach-inherited-button"
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>,
      );
    }

    if (hasNicOverride) {
      buttons.push(
        <Button
          className="p-segmented-control__button p-action-button p-button"
          onClick={detachInherited}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Detach network"}
          disabled={isDisabled}
          key="detach-overridden-button"
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>,
      );
    }

    if (hasNoneOverride) {
      buttons.push(
        <Button
          className="p-segmented-control__button p-action-button p-button"
          onClick={clearOverride}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Reattach inherited network"}
          disabled={isDisabled}
          key="reattach-button"
        >
          <Icon name="connected" />
          <span>Reattach</span>
        </Button>,
      );
    }

    if (isLocal) {
      buttons.push(
        <Button
          className="p-segmented-control__button p-action-button p-button"
          onClick={detachOverridden}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Detach network"}
          disabled={isDisabled}
          key="detach-local-button"
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>,
      );
    }

    if (hasNicOverride) {
      buttons.push(
        <Button
          className="p-segmented-control__button p-action-button p-button"
          onClick={clearOverride}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "Clear override"}
          disabled={isDisabled}
          key="clear-override-button"
        >
          <Icon name="close" />
          <span>Clear</span>
        </Button>,
      );
    }

    return buttons;
  };

  return (
    <div className="network-device-actions p-segmented-control">
      <div className="p-segmented-control__list">{getActionButtons()}</div>
    </div>
  );
};

export default NetworkDeviceActionButtons;
