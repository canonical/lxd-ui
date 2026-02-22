import type { ReactNode } from "react";
import classnames from "classnames";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { LxdNetwork } from "types/network";
import type { LxdNicDevice } from "types/device";
import type { CustomNetworkDevice } from "types/formDevice";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import DeviceName from "components/forms/DeviceName";
import { Icon, Tooltip } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import ExpandableList from "components/ExpandableList";
import { combineAcls, getNetworkAcls } from "util/networks";
import { getDeviceAcls } from "util/devices";
import NetworkRichChip from "pages/networks/NetworkRichChip";
import { ROOT_PATH } from "util/rootPath";
import NetworkDefaultACLRead from "pages/networks/forms/NetworkDefaultACLRead";

const getNetworkDeviceIpAddress = ({
  network,
  device,
  family,
}: {
  network?: LxdNetwork;
  device: LxdNicDevice;
  family: "IPv4" | "IPv6";
}) => {
  if (!network || !network.config) {
    return null;
  }

  const addressString = family === "IPv4" ? "ipv4.address" : "ipv6.address";
  const networkIP = network.config[addressString];
  const deviceIP = device[addressString];

  return networkIP !== "none" ? deviceIP || "dynamic" : null;
};

export const getNetworkDeviceRows = ({
  project,
  managedNetworks,
  device,
  showIpAddresses,
  isDetached,
  hasChanges,
  actions,
  sourceProfile,
}: {
  project: string;
  managedNetworks: LxdNetwork[];
  device: LxdNicDevice | CustomNetworkDevice | null;
  showIpAddresses?: boolean;
  isDetached?: boolean;
  hasChanges?: boolean;
  actions: ReactNode;
  sourceProfile?: ReactNode;
}): MainTableRow[] => {
  const rows: MainTableRow[] = [];

  if (!device) return rows;

  rows.push(
    getConfigurationRowBase({
      className: "device-first-row",
      configuration: (
        <DeviceName
          name={device.name || ""}
          hasChanges={hasChanges}
          isDetached={isDetached}
        />
      ),
      inherited: null,
      override: actions,
    }),
  );

  if (sourceProfile) {
    rows.push(
      getConfigurationRowBase({
        className: "no-border-top",
        configuration: <div className="u-text--muted">From profile</div>,
        inherited: sourceProfile,
        override: null,
      }),
    );
  }

  if (device.type === "custom-nic") {
    rows.push(
      getConfigurationRowBase({
        className: "no-border-top device-last-row",
        configuration: (
          <div
            className={classnames({
              "u-text--line-through": isDetached,
            })}
          >
            custom network{" "}
            <Tooltip message="A custom network can be viewed and edited only from the YAML configuration">
              <Icon name="information" />
            </Tooltip>
          </div>
        ),
        inherited: null,
        override: null,
      }),
    );
    return rows;
  }

  const network = managedNetworks.find((t) => t.name === device.network);

  if (network) {
    rows.push(
      getConfigurationRowBase({
        className: "no-border-top",
        configuration: <div className="u-text--muted">Network</div>,
        inherited: (
          <div>
            <NetworkRichChip
              networkName={device.network}
              projectName={project || "default"}
              className={classnames({
                "u-text--line-through": isDetached,
              })}
            />
          </div>
        ),
        override: null,
      }),
    );

    const acls = combineAcls(getNetworkAcls(network), getDeviceAcls(device));

    if (showIpAddresses) {
      const families = ["IPv4", "IPv6"] as const;
      const activeIps = families
        .map((family) => ({
          family,
          ip: getNetworkDeviceIpAddress({ network, device, family }),
        }))
        .filter((item) => !!item.ip);

      activeIps.forEach(({ family, ip }, index) => {
        rows.push(
          getConfigurationRowBase({
            className: classnames("no-border-top", {
              "device-last-row":
                acls.length === 0 && index === activeIps.length - 1,
            }),
            configuration: <div className="u-text--muted">{family}</div>,
            inherited: (
              <div>
                <b
                  className={classnames("mono-font", {
                    "u-text--line-through": isDetached,
                  })}
                >
                  {ip}
                </b>
              </div>
            ),
            override: null,
          }),
        );
      });
    }

    if (acls.length > 0) {
      rows.push(
        getConfigurationRowBase({
          className: "no-border-top",
          configuration: <div className="u-text--muted">ACLs</div>,
          inherited: (
            <div>
              <ExpandableList
                items={acls.map((acl) => (
                  <ResourceLink
                    key={acl}
                    type="network-acl"
                    value={acl}
                    to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl)}`}
                    className={classnames("acl-chip", {
                      "u-text--line-through": isDetached,
                    })}
                  />
                ))}
              />
            </div>
          ),
          override: null,
        }),
      );
    }

    if (acls.length > 0) {
      const getDefaultEgressIngress = () => {
        return {
          Egress:
            device["security.acls.default.egress.action"] ??
            network.config["security.acls.default.egress.action"] ??
            "",
          Ingress:
            device["security.acls.default.ingress.action"] ??
            network.config["security.acls.default.ingress.action"] ??
            "",
        };
      };

      rows.push(
        getConfigurationRowBase({
          className: classnames("no-border-top device-last-row acl-defaults", {
            "u-text--line-through": isDetached,
          }),
          configuration: <div className="u-text--muted"></div>,
          inherited: (
            <div>
              <NetworkDefaultACLRead values={getDefaultEgressIngress()} />
            </div>
          ),
          override: null,
        }),
      );
    }
  }

  return rows;
};
