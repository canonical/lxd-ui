import { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { FormikProps } from "formik";
import { StoragePoolFormValues } from "./StoragePoolForm";
import { cephDriver, powerFlex, zfsDriver } from "util/storageOptions";
import { isPowerflexIncomplete } from "util/storagePool";

export const MAIN_CONFIGURATION = "Main configuration";
export const CEPH_CONFIGURATION = "Ceph";
export const POWERFLEX = "Powerflex";
export const ZFS_CONFIGURATION = "ZFS";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormMenu: FC<Props> = ({ formik, active, setActive }) => {
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
  };

  const isCephDriver = formik.values.driver === cephDriver;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const isZfsDriver = formik.values.driver === zfsDriver;
  const hasName = formik.values.name.length > 0;
  const disableReason = hasName
    ? isPowerflexIncomplete(formik)
      ? "Please enter a domain, gateway, pool, and user name to enable this section"
      : undefined
    : "Please enter a storage pool name to enable this section";

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);
  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Storage pool form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          {isCephDriver && (
            <MenuItem
              label={CEPH_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isPowerFlexDriver && (
            <MenuItem
              label={POWERFLEX}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isZfsDriver && (
            <MenuItem
              label={ZFS_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
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

export default StoragePoolFormMenu;
