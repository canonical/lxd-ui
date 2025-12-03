import {
  ActionButton,
  Button,
  Form,
  Input,
  ScrollableContainer,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useId, type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import NotificationRow from "components/NotificationRow";
import NetworkDeviceIPAddressEdit from "components/forms/NetworkDevicesForm/edit/NetworkDeviceIPAddressEdit";
import { useNetworks } from "context/useNetworks";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";
import { getDeviceAcls, isNoneDevice } from "util/devices";
import type { FormNetworkDevice } from "util/formDevices";
import { deduplicateName } from "util/formDevices";
import { type InheritedNetwork } from "util/configInheritance";
import {
  supportsNicDeviceAcls,
  getNetworkAcls,
  combineAcls,
  supportsStaticIPs,
} from "util/networks";
import classnames from "classnames";

export interface NetworkDeviceFormValues {
  name: string;
  network: string;
  acls?: string;
  ipv4?: string;
  ipv6?: string;
}

interface CreateProps {
  mode: "create";
  project: string;
  onClose: () => void;
  onSave: (newDevice: FormNetworkDevice) => void;
  existingDeviceNames: string[];
  inheritedNetworks: InheritedNetwork[];
  networkDeviceNames: string[];
  shouldDisplayIpAddresses: boolean;
}

interface EditProps {
  mode: "create-override" | "edit-override" | "edit-local";
  device?: LxdNicDevice | LxdNoneDevice;
  inheritedDevice?: InheritedNetwork;
  project: string;
  onClose: () => void;
  onSave: (updatedDevice: FormNetworkDevice) => void;
  existingDeviceNames: string[];
  inheritedNetworks: InheritedNetwork[];
  shouldDisplayIpAddresses: boolean;
}

type Props = CreateProps | EditProps;

const NetworkDevicePanel: FC<Props> = (props) => {
  const {
    mode,
    project,
    onClose,
    onSave,
    existingDeviceNames,
    inheritedNetworks,
    shouldDisplayIpAddresses,
  } = props;
  const notify = useNotify();
  const networkAclSelectorId = useId();

  const { data: networks = [] } = useNetworks(project);

  const managedNetworks = networks.filter((network) => network.managed);

  const isCreatingOverride = mode === "create-override";
  const isCreatingLocal = mode === "create";
  const isEditingOverride = mode === "edit-override";

  const isOverride = isCreatingOverride || isEditingOverride;

  const getInvalidNames = () => {
    if (isCreatingOverride) {
      return [];
    }

    if (isCreatingLocal) {
      return existingDeviceNames;
    }

    return existingDeviceNames.filter((name) => name !== props.device?.name);
  };

  const validationSchema = Yup.object({
    name: isCreatingOverride
      ? Yup.string().required("Device name is required")
      : Yup.string()
          .required("Device name is required")
          .matches(/^[A-Za-z0-9/\-:_.]+$/, {
            message:
              "Name can only contain alphanumeric, forward slash, hyphen, colon, underscore and full stop characters",
          })
          .notOneOf(
            getInvalidNames(),
            "A device with this name already exists",
          ),
    network: Yup.string().required("Network is required"),
  });

  const getInitialValues = (): NetworkDeviceFormValues => {
    const defaultNetworkName = managedNetworks[0]?.name ?? "";
    const defaultAcls = getNetworkAcls(managedNetworks[0]).join(",");

    if (isCreatingLocal) {
      const { networkDeviceNames } = props;
      const inheritedNetworkNames = inheritedNetworks.map((item) => item.key);
      const allNetworkNames = [...networkDeviceNames, ...inheritedNetworkNames];
      const deviceName = deduplicateName("eth", 1, allNetworkNames);

      return {
        name: deviceName,
        network: defaultNetworkName,
        acls: defaultAcls,
        ipv4: "",
        ipv6: "",
      };
    }

    if (isCreatingOverride) {
      const { inheritedDevice } = props;
      if (!inheritedDevice) {
        throw new Error("Cannot create override: inheritedDevice is required");
      }

      const network = managedNetworks.find(
        (t) => t.name === inheritedDevice.network?.name,
      );
      return {
        name: inheritedDevice.key,
        network: inheritedDevice.network?.network || defaultNetworkName,
        acls: combineAcls(
          getNetworkAcls(network),
          getDeviceAcls(inheritedDevice.network),
        ).join(","),
        ipv4: "",
        ipv6: "",
      };
    }

    // Edit modes: edit-override or edit-local
    const { device } = props;
    if (!device || isNoneDevice(device)) {
      throw new Error(
        "Cannot edit network device: device is missing or is of type 'none'",
      );
    }

    const deviceNetworkName = device.network || defaultNetworkName;
    const currentNetwork = managedNetworks.find(
      (n) => n.name === deviceNetworkName,
    );

    const combinedAcls = combineAcls(
      getNetworkAcls(currentNetwork),
      getDeviceAcls(device),
    ).join(",");

    return {
      name: device.name || "",
      network: deviceNetworkName,
      acls: combinedAcls,
      ipv4: device["ipv4.address"] || "",
      ipv6: device["ipv6.address"] || "",
    };
  };

  const formik = useFormik<NetworkDeviceFormValues>({
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit: (values) => {
      const allSelectedAcls = values.acls
        ? values.acls.split(",").filter(Boolean)
        : [];
      const userSelectedAcls = allSelectedAcls.filter(
        (acl) =>
          !getNetworkAcls(
            managedNetworks.find((n) => n.name === values.network),
          ).includes(acl),
      );

      const deviceData: FormNetworkDevice = {
        name: values.name,
        type: "nic",
        network: values.network,
        "security.acls":
          userSelectedAcls.length > 0 ? userSelectedAcls.join(",") : undefined,
        "ipv4.address": values.ipv4 || undefined,
        "ipv6.address": values.ipv6 || undefined,
      };

      onSave(deviceData);
      onClose();
    },
  });

  const selectedNetwork = managedNetworks.find(
    (n) => n.name === formik.values.network,
  );
  const networkAcls = getNetworkAcls(selectedNetwork);
  const userSelectedAcls = formik.values.acls
    ? formik.values.acls.split(",").filter(Boolean)
    : [];
  const selectedAcls = Array.from(
    new Set(networkAcls.concat(userSelectedAcls)),
  );

  const getAclHelperText = (): ReactNode => {
    if (supportsNicDeviceAcls(selectedNetwork)) {
      return networkAcls.length > 0
        ? "Some ACLs are inherited from the network. They cannot be deselected here."
        : undefined;
    }
    return "Network must be of type OVN to customize ACLs.";
  };

  const handleCancel = () => {
    formik.resetForm();
    notify.clear();
    onClose();
  };

  const getTitle = () => {
    if (isCreatingLocal) return "Create network device";
    if (isCreatingOverride) return "Create override";
    if (isEditingOverride) return "Edit override";
    return "Edit network device";
  };

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>{getTitle()}</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notify.notification]}
          belowIds={["panel-footer"]}
        >
          <Form onSubmit={formik.handleSubmit} stacked>
            <Input
              label="Device name"
              required
              id="name"
              {...formik.getFieldProps("name")}
              type="text"
              placeholder="Enter device name"
              error={formik.touched.name && formik.errors.name}
              disabled={isOverride}
            />

            <NetworkSelector
              value={formik.values.network}
              setValue={(value) => {
                void formik.setFieldValue("network", value);

                const selectedNetwork = managedNetworks.find(
                  (n) => n.name === value,
                );
                const newNetworkAcls = getNetworkAcls(selectedNetwork);

                if (!supportsNicDeviceAcls(selectedNetwork)) {
                  void formik.setFieldValue("acls", "");
                } else {
                  void formik.setFieldValue("acls", newNetworkAcls.join(","));
                }

                if (!supportsStaticIPs(selectedNetwork)) {
                  void formik.setFieldValue("ipv4", "");
                  void formik.setFieldValue("ipv6", "");
                }
              }}
              networkList={managedNetworks}
              id="network"
              label="Network"
              required
              error={formik.touched.network ? formik.errors.network : undefined}
            />

            <label
              className={classnames({
                "u-text--muted": !supportsNicDeviceAcls(selectedNetwork),
              })}
              htmlFor={networkAclSelectorId}
            >
              ACLs
            </label>
            <NetworkAclSelector
              project={project}
              selectedAcls={selectedAcls}
              setSelectedAcls={(selectedItems) => {
                void formik.setFieldValue("acls", selectedItems.join(","));
              }}
              id={networkAclSelectorId}
              inheritedAcls={networkAcls}
              canSelectManualAcls={supportsNicDeviceAcls(selectedNetwork)}
              help={getAclHelperText()}
            />

            {shouldDisplayIpAddresses && selectedNetwork && (
              <>
                <NetworkDeviceIPAddressEdit
                  formik={formik}
                  network={selectedNetwork}
                  family="IPv4"
                />
                <NetworkDeviceIPAddressEdit
                  formik={formik}
                  network={selectedNetwork}
                  family="IPv6"
                />
              </>
            )}
          </Form>
        </ScrollableContainer>
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <Button appearance="base" onClick={handleCancel} type="button">
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={!formik.isValid}
          onClick={() => void formik.submitForm()}
          type="submit"
        >
          Apply changes
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default NetworkDevicePanel;
