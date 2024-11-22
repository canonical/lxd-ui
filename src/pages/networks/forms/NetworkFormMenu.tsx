import { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

export const MAIN_CONFIGURATION = "Main configuration";
export const BRIDGE = "Bridge";
export const DNS = "DNS";
export const IPV4 = "IPv4";
export const IPV6 = "IPv6";
export const OVN = "OVN";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormMenu: FC<Props> = ({ active, setActive, formik }) => {
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
  };

  const hasName = formik.values.name.length > 0;
  const isPhysicalWithoutParent =
    formik.values.networkType === "physical" &&
    !formik.values.parent &&
    formik.values.isCreating;

  const disableReason = hasName
    ? isPhysicalWithoutParent
      ? "Please select a parent network to enable this section"
      : ""
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
          {formik.values.networkType !== "physical" && (
            <MenuItem
              label={BRIDGE}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
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
          {formik.values.networkType === "physical" && (
            <MenuItem
              label={OVN}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NetworkFormMenu;
