import {
  ActionButton,
  Button,
  Form,
  Input,
  Notification,
  ScrollableContainer,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { LxdNicDevice } from "types/device";
import NotificationRow from "components/NotificationRow";
import NetworkDeviceIPAddressEdit from "components/forms/NetworkDevicesForm/edit/NetworkDeviceIPAddressEdit";
import { useNetworks } from "context/useNetworks";
import { useProfiles } from "context/useProfiles";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";
import {
  getDeviceAcls,
  getExistingDeviceNames,
  isValidIPV6,
} from "util/devices";
import { isIPv4 } from "@canonical/react-components";
import type { FormDevice, FormNetworkDevice } from "types/formDevice";
import { deduplicateName } from "util/formDevices";
import { getInheritedNetworks } from "util/configInheritance";
import {
  supportsNicDeviceAcls,
  getNetworkAcls,
  combineAcls,
  ovnType,
} from "util/networks";
import usePanelParams, { panels } from "util/usePanelParams";
import NetworkDefaultACLSelector, {
  type Direction,
} from "pages/networks/forms/NetworkDefaultACLSelector";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { NetworkDeviceFormValues } from "types/forms/networkDevice";

interface Props {
  project: string;
  formik: InstanceAndProfileFormikProps;
  onSave?: () => void;
}

const NetworkDevicePanel: FC<Props> = ({
  project,
  formik: parentFormik,
  onSave,
}) => {
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: profiles = [], isLoading: isLoadingProfiles } =
    useProfiles(project);
  const { data: networks = [], isLoading: isLoadingNetworks } =
    useNetworks(project);
  const isLoading = isLoadingProfiles || isLoadingNetworks;

  const existingDeviceNames = getExistingDeviceNames(
    parentFormik.values,
    profiles,
  );

  const isInstance = parentFormik.values.entityType === "instance";

  const deviceName = panelParams?.deviceName;
  const device = parentFormik.values.devices.find(
    (d) => d.name === deviceName && d.type === "nic",
  ) as LxdNicDevice | undefined;

  const inheritedNetworks = getInheritedNetworks(parentFormik.values, profiles);
  const inheritedDevice = inheritedNetworks.find((d) => d.key === deviceName);

  const isCreatingLocal = panelParams?.panel === panels.createNetworkDevice;
  const isCreatingOverride = inheritedDevice && !device;
  const isEditingOverride = inheritedDevice && device;

  const isOverride = Boolean(isCreatingOverride || isEditingOverride);

  const managedNetworks = networks.filter((network) => network.managed);

  const getNetworkAclsByNetworkName = (networkName: string) => {
    const network = managedNetworks.find((n) => n.name === networkName);
    return getNetworkAcls(network);
  };

  const invalidDeviceNames = existingDeviceNames.filter(
    (name) => name !== device?.name,
  );

  const validationSchema = isLoading
    ? Yup.object({})
    : Yup.object({
        ipv4: Yup.string().test(
          "is-valid-ipv4",
          "Please enter a valid IPv4 address",
          (value) => !value || isIPv4(value),
        ),
        ipv6: Yup.string().test(
          "is-valid-ipv6",
          "Please enter a valid IPv6 address",
          (value) => !value || isValidIPV6(value),
        ),
        ...(!isOverride && {
          name: Yup.string()
            .required("Device name is required")
            .min(1, "Name must be at least 1 character long")
            .max(63, "Name must be at most 63 characters long")
            .matches(/^[A-Za-z0-9/\-:_.]+$/, {
              message:
                "Name can only contain alphanumeric, forward slash, hyphen, colon, underscore and full stop characters",
            })
            .notOneOf(
              invalidDeviceNames,
              "A device with this name already exists",
            ),
        }),
        network: Yup.string().required("Network is required"),
      });

  const getInitialValues = (): NetworkDeviceFormValues => {
    const defaultNetworkName = managedNetworks[0]?.name ?? "";
    const defaultAcls =
      getNetworkAclsByNetworkName(defaultNetworkName).join(",");

    if (isCreatingLocal) {
      const deviceName = deduplicateName("eth", 1, existingDeviceNames);

      return {
        name: deviceName,
        network: defaultNetworkName,
        acls: defaultAcls,
        ipv4: "",
        ipv6: "",
      };
    }

    if (isCreatingOverride) {
      return {
        name: inheritedDevice.key,
        network: inheritedDevice.network?.network || defaultNetworkName,
        acls: combineAcls(
          getNetworkAclsByNetworkName(inheritedDevice.network?.name || ""),
          getDeviceAcls(inheritedDevice.network),
        ).join(","),
        ipv4: "",
        ipv6: "",
      };
    }

    const deviceNetworkName = device?.network || defaultNetworkName;

    const combinedAcls = combineAcls(
      getNetworkAclsByNetworkName(deviceNetworkName),
      getDeviceAcls(device),
    ).join(",");

    return {
      name: device?.name || "",
      network: deviceNetworkName,
      acls: combinedAcls,
      ipv4: device?.["ipv4.address"] || "",
      ipv6: device?.["ipv6.address"] || "",
      security_acls_default_egress_action:
        device?.["security.acls.default.egress.action"] || "",
      security_acls_default_ingress_action:
        device?.["security.acls.default.ingress.action"] || "",
    };
  };

  const formik = useFormik<NetworkDeviceFormValues>({
    enableReinitialize: true,
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit: (values) => {
      const allSelectedAcls = values.acls ? values.acls.split(",") : [];
      const networkAcls = getNetworkAcls(
        managedNetworks.find((n) => n.name === values.network),
      );
      const userSelectedAcls = allSelectedAcls.filter(
        (acl) => !networkAcls.includes(acl),
      );

      const deviceData: FormNetworkDevice = {
        name: values.name,
        type: "nic",
        network: values.network,
        "security.acls":
          userSelectedAcls.length > 0 ? userSelectedAcls.join(",") : undefined,
        "ipv4.address": values.ipv4 || undefined,
        "ipv6.address": values.ipv6 || undefined,
        "security.acls.default.egress.action":
          values.security_acls_default_egress_action || undefined,
        "security.acls.default.ingress.action":
          values.security_acls_default_ingress_action || undefined,
      };

      const originalDeviceName = deviceName;
      const { devices } = parentFormik.values;
      const existingDeviceIndex = devices.findIndex(
        (d) => d.name === originalDeviceName,
      );
      let updatedDevices: FormDevice[];
      if (existingDeviceIndex !== -1) {
        updatedDevices = [...devices];
        updatedDevices[existingDeviceIndex] = deviceData;
      } else {
        updatedDevices = [...devices, deviceData];
      }

      parentFormik.setFieldValue("devices", updatedDevices);

      onSave?.();
      panelParams.clear();
    },
  });

  const getTitle = () => {
    if (isCreatingLocal) return "Create network device";
    if (isCreatingOverride) return "Create override";
    if (isEditingOverride) return "Edit override";
    return "Edit network device";
  };

  const selectedNetwork = managedNetworks.find(
    (n) => n.name === formik.values.network,
  );

  const networkAcls = getNetworkAclsByNetworkName(formik.values.network);
  const allSelectedAcls = formik.values.acls
    ? formik.values.acls.split(",")
    : [];
  const selectedAcls = Array.from(new Set(networkAcls.concat(allSelectedAcls)));

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
    panelParams.clear();
  };

  if (!isLoading && !isCreatingLocal && !device && !inheritedDevice) {
    return (
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Device not found</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <SidePanel.Content className="padding--medium">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <Notification severity="negative">
              The device {deviceName && <strong>{deviceName}</strong>} could not
              be found. It may have been deleted or the URL is incorrect.
            </Notification>
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <Button appearance="base" onClick={handleCancel}>
            Close
          </Button>
        </SidePanel.Footer>
      </SidePanel>
    );
  }

  const getDefaultEgressIngress = () => {
    // Return NIC device default egress/ingress actions if set, fallback to network defaults if not, or rejected if neither are set
    return {
      Egress:
        formik.values.security_acls_default_egress_action ??
        selectedNetwork?.config["security.acls.default.egress.action"] ??
        "",
      Ingress:
        formik.values.security_acls_default_ingress_action ??
        selectedNetwork?.config["security.acls.default.ingress.action"] ??
        "",
    };
  };

  const directionField: Record<Direction, string> = {
    Egress: "security_acls_default_egress_action",
    Ingress: "security_acls_default_ingress_action",
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

                const newNetworkAcls = getNetworkAclsByNetworkName(value);
                void formik.setFieldValue("acls", newNetworkAcls.join(","));

                void formik.setFieldValue("ipv4", "");
                void formik.setFieldValue("ipv6", "");
              }}
              networkList={managedNetworks}
              id="network"
              label="Network"
              required
              error={formik.touched.network ? formik.errors.network : undefined}
            />

            {isInstance && selectedNetwork && (
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

            <NetworkAclSelector
              project={project}
              selectedAcls={selectedAcls}
              setSelectedAcls={(selectedItems) => {
                void formik.setFieldValue("acls", selectedItems.join(","));
              }}
              inheritedAcls={networkAcls}
              canSelectManualAcls={supportsNicDeviceAcls(selectedNetwork)}
              help={getAclHelperText()}
              label="ACLs"
            />

            <NetworkDefaultACLSelector
              onChange={(fieldValue, value) => {
                void formik.setFieldValue(fieldValue, value);
              }}
              values={getDefaultEgressIngress()}
              disabled={
                formik.values.acls?.length === 0 ||
                selectedNetwork?.type !== ovnType
              }
              directionField={directionField}
            />
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
          disabled={isLoading || !formik.isValid}
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
