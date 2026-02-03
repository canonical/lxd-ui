import type { FC } from "react";
import MenuItem from "components/forms/FormMenuItem";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "types/forms/network";
import { typesWithParent } from "util/networks";

export const CONNECTIONS = "Connections";
export const GENERAL = "General";
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
  availableSections: string[];
}

const NetworkFormMenu: FC<Props> = ({
  active,
  setActive,
  formik,
  availableSections,
}) => {
  const menuItemProps = {
    active,
    setActive,
  };

  const hasName = formik.values.name.length > 0;
  const isMissingParent =
    typesWithParent.includes(formik.values.networkType) &&
    !formik.values.parent &&
    formik.values.isCreating;

  const disableReason = hasName
    ? isMissingParent
      ? "Please select a parent network to enable this section"
      : ""
    : "Please enter a network name to enable this section";

  return (
    <nav aria-label="Network form navigation" className="toc-tree">
      <ul>
        <MenuItem label={GENERAL} {...menuItemProps} />
        {availableSections.includes(BRIDGE) && (
          <MenuItem
            label={BRIDGE}
            {...menuItemProps}
            disableReason={disableReason}
          />
        )}
        {availableSections.includes(IPV4) && (
          <MenuItem
            label={IPV4}
            {...menuItemProps}
            disableReason={disableReason}
          />
        )}
        {availableSections.includes(IPV6) && (
          <MenuItem
            label={IPV6}
            {...menuItemProps}
            disableReason={disableReason}
          />
        )}
        {availableSections.includes(DNS) && (
          <MenuItem
            label={DNS}
            {...menuItemProps}
            disableReason={disableReason}
          />
        )}
        {availableSections.includes(OVN) && (
          <MenuItem
            label={OVN}
            {...menuItemProps}
            disableReason={disableReason}
          />
        )}
      </ul>
    </nav>
  );
};

export default NetworkFormMenu;
