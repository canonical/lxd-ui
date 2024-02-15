import { FC, useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

export const MAIN_CONFIGURATION = "Main configuration";
export const BRIDGE = "Bridge";
export const DNS = "DNS";
export const IPV4 = "IPv4";
export const IPV6 = "IPv6";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormMenu: FC<Props> = ({ active, setActive, formik }) => {
  const notify = useNotify();
  const [isAdvancedOpen, setAdvancedOpen] = useState(!formik.values.isCreating);
  const menuItemProps = {
    active,
    setActive,
  };

  const hasName = formik.values.name.length > 0;
  const disableReason = hasName
    ? undefined
    : "Please enter a network name to enable this section";

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);
  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Network form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={
                !disableReason && isAdvancedOpen ? "true" : "false"
              }
              onClick={() => setAdvancedOpen(!isAdvancedOpen)}
              disabled={Boolean(disableReason)}
              title={disableReason}
            >
              Advanced
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={
                !disableReason && isAdvancedOpen ? "true" : "false"
              }
            >
              <MenuItem
                label={BRIDGE}
                {...menuItemProps}
                disableReason={disableReason}
              />
              <MenuItem
                label={DNS}
                {...menuItemProps}
                disableReason={disableReason}
              />
              {formik.values.ipv4_address !== "none" && (
                <MenuItem
                  label={IPV4}
                  {...menuItemProps}
                  disableReason={disableReason}
                />
              )}
              {formik.values.ipv6_address !== "none" && (
                <MenuItem
                  label={IPV6}
                  {...menuItemProps}
                  disableReason={disableReason}
                />
              )}
            </ul>
          </li>
          <MenuItem
            label={YAML_CONFIGURATION}
            {...menuItemProps}
            disableReason={disableReason}
          />
        </ul>
      </nav>
    </div>
  );
};

export default NetworkFormMenu;
