import React, { FC, useEffect } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";
import { Button } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { useNotify } from "context/notify";

export const NETWORK_DETAILS = "Network details";
export const DNS = "DNS";
export const IPV4 = "IPv4";
export const IPV6 = "IPv6";
export const USER = "User";

interface Props {
  active: string;
  setActive: (val: string) => void;
}

const NetworkFormMenu: FC<Props> = ({ active, setActive }) => {
  const notify = useNotify();
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
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded="true"
            >
              Configuration options
            </Button>
            <ul className="p-side-navigation__list" aria-expanded="true">
              <MenuItem label={DNS} {...menuItemProps} />
              <MenuItem label={IPV4} {...menuItemProps} />
              <MenuItem label={IPV6} {...menuItemProps} />
              <MenuItem label={USER} {...menuItemProps} />
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NetworkFormMenu;
