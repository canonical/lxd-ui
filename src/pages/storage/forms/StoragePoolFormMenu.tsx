import { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { FormikProps } from "formik";
import { StoragePoolFormValues } from "./StoragePoolForm";
import {
  cephDriver,
  cephFSDriver,
  powerFlex,
  pureStorage,
  zfsDriver,
} from "util/storageOptions";
import {
  isPowerflexIncomplete,
  isPureStorageIncomplete,
} from "util/storagePool";

export const MAIN_CONFIGURATION = "Main configuration";
export const CEPH_CONFIGURATION = "Ceph";
export const CEPHFS_CONFIGURATION = "CephFS";
export const POWERFLEX = "Powerflex";
export const ZFS_CONFIGURATION = "ZFS";
export const YAML_CONFIGURATION = "YAML configuration";
export const PURE_STORAGE = "Pure Storage";

interface Props {
  active: string;
  setActive: (val: string) => void;
  formik: FormikProps<StoragePoolFormValues>;
  isSupportedStorageDriver: boolean;
}

const StoragePoolFormMenu: FC<Props> = ({
  formik,
  active,
  setActive,
  isSupportedStorageDriver,
}) => {
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
  };

  const isCephDriver = formik.values.driver === cephDriver;
  const isCephFSDriver = formik.values.driver === cephFSDriver;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const isPureDriver = formik.values.driver === pureStorage;
  const isZfsDriver = formik.values.driver === zfsDriver;
  const hasName = formik.values.name.length > 0;
  const getDisableReason = () => {
    if (!hasName) {
      return "Please enter a storage pool name to enable this section";
    }
    if (isPowerflexIncomplete(formik)) {
      return "Please enter a domain, gateway, pool, and user name to enable this section";
    }
    if (isPureStorageIncomplete(formik)) {
      return "Please enter an API token and gateway to enable this section";
    }
    return undefined;
  };
  const disableReason = getDisableReason();

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Storage pool form navigation">
        <ul className="p-side-navigation__list">
          {isSupportedStorageDriver && (
            <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          )}
          {isCephDriver && (
            <MenuItem
              label={CEPH_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isCephFSDriver && (
            <MenuItem
              label={CEPHFS_CONFIGURATION}
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
          {isPureDriver && (
            <MenuItem
              label={PURE_STORAGE}
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
        </ul>
      </nav>
    </div>
  );
};

export default StoragePoolFormMenu;
