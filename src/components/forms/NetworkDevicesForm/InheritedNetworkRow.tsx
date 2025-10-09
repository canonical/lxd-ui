import ResourceLink from "components/ResourceLink";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import ReadOnlyAclsList from "components/forms/NetworkDevicesForm/ReadOnlyAclsList";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { InheritedNetwork } from "util/configInheritance";
import type { LxdNetwork } from "types/network";
import { Button, Icon, Tooltip } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import classNames from "classnames";
import NetworkDevice from "./NetworkDevice";
import type { LxdNicDevice } from "types/device";
import { ensureEditMode } from "util/instanceEdit";

interface Props {
  device: InheritedNetwork;
  project: string;
  managedNetworks: LxdNetwork[];
  formik: InstanceAndProfileFormikProps;
  focusNetwork: (id: number) => void;
  removeNetwork: (deviceName: string) => void;
  isOverridden: boolean;
}

export const getInheritedNetworkRow = ({
  device,
  project,
  managedNetworks,
  formik,
  focusNetwork,
  removeNetwork,
  isOverridden: isOverridden,
}: Props): MainTableRow => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const overrideDevice = formik.values.devices.find(
    (t) => t.name === device.key,
  ) as LxdNicDevice;

  const overrideNetwork = managedNetworks.find(
    (t) =>
      t.name ===
      (formik.values.devices.find((t) => t.name === device.key) as LxdNicDevice)
        ?.network,
  );

  return getConfigurationRowBase({
    configuration: (
      <>
        <b>{device.key}</b>
      </>
    ),
    inherited: (
      <div>
        <div
          className={classNames("p-text--small", "u-text--muted", {
            "u-text--line-through": isOverridden,
          })}
        >
          From: {device.source}
        </div>
        <div
          className={classNames({
            "u-text--muted": isOverridden,
            "u-text--line-through": isOverridden,
          })}
        >
          Network
        </div>
        <ResourceLink
          type="network"
          value={device.network?.network || ""}
          to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(device.network?.network || "")}`}
          className={classNames({
            "u-text--muted": isOverridden,
            "u-text--line-through": isOverridden,
          })}
        />
        <ReadOnlyAclsList
          project={project}
          network={managedNetworks.find(
            (t) => t.name === device.network?.network,
          )}
          device={device.network}
        />
      </div>
    ),
    override: (
      <div>
        <Tooltip
          message="This network is inherited from a profile or project.
To change it, edit it in the profile or project it originates from,
or remove the originating item"
          position="btm-left"
        >
          <Icon name="information" />
        </Tooltip>
        {!isOverridden && (
          <Button
            onClick={() => {
              ensureEditMode(formik);
              const copy = [...formik.values.devices];
              copy.push({
                type: "nic",
                name: device.key,
                network: managedNetworks[0]?.name ?? "",
              });
              formik.setFieldValue("devices", copy);

              focusNetwork(
                formik?.values.devices.findIndex((t) => t.name === device.key),
              );
            }}
            type="button"
            appearance="base"
            title={formik.values.editRestriction ?? "Override network"}
            className="u-no-margin--top"
            hasIcon
            dense
            disabled={!!formik.values.editRestriction}
          >
            <Icon name="edit" />
          </Button>
        )}
        {isOverridden && overrideNetwork && (
          <NetworkDevice
            readOnly={readOnly}
            formik={formik}
            project={project}
            focusNetwork={focusNetwork}
            removeNetwork={removeNetwork}
            device={overrideDevice}
            network={overrideNetwork}
          />
        )}
      </div>
    ),
  });
};
