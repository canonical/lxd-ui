import React, { FC, useEffect, useState } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";
import { Button } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { useNotify } from "context/notify";
import { LxdNetworkType } from "types/network";

export const NETWORK_DETAILS = "Network details";
export const ADVANCED_OVN = "Advanced";
export const BRIDGE = "Bridge";
export const DNS = "DNS";
export const IPV4 = "IPv4";
export const IPV6 = "IPv6";
export const USER = "User";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  networkType: LxdNetworkType;
  hasName: boolean;
}

const NetworkFormMenu: FC<Props> = ({
  active,
  setActive,
  networkType,
  hasName,
}) => {
  const notify = useNotify();
  const [isConfigOpen, setConfigOpen] = useState(false);
  const menuItemProps = {
    active,
    setActive,
  };

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);
  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Network form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={NETWORK_DETAILS} {...menuItemProps} />
          {networkType !== "ovn" && (
            <li className="p-side-navigation__item">
              <Button
                type="button"
                className="p-side-navigation__accordion-button"
                aria-expanded={isConfigOpen ? "true" : "false"}
                onClick={() => setConfigOpen(!isConfigOpen)}
                disabled={!hasName}
                title={
                  hasName
                    ? ""
                    : "Please select an image before adding custom configuration"
                }
              >
                Configuration options
              </Button>

              <ul
                className="p-side-navigation__list"
                aria-expanded={isConfigOpen ? "true" : "false"}
              >
                <MenuItem label={BRIDGE} {...menuItemProps} />
                <MenuItem label={DNS} {...menuItemProps} />
                <MenuItem label={IPV4} {...menuItemProps} />
                <MenuItem label={IPV6} {...menuItemProps} />
                <MenuItem label={USER} {...menuItemProps} />
              </ul>
            </li>
          )}
          {networkType === "ovn" &&
            (hasName ? (
              <MenuItem label={ADVANCED_OVN} {...menuItemProps} />
            ) : (
              <li className="p-side-navigation__item">
                <Button
                  className="p-side-navigation__link p-button--base"
                  disabled={true}
                  title="Please enter a name before adding custom configuration"
                >
                  {ADVANCED_OVN}
                </Button>
              </li>
            ))}
          {hasName ? (
            <MenuItem label={YAML_CONFIGURATION} {...menuItemProps} />
          ) : (
            <li className="p-side-navigation__item">
              <Button
                className="p-side-navigation__link p-button--base"
                disabled={true}
                title="Please enter a name before adding custom configuration"
              >
                {YAML_CONFIGURATION}
              </Button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NetworkFormMenu;
