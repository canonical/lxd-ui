import React, { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { FormikProps } from "formik";
import { StoragePoolFormValues } from "./StoragePoolForm";
import { cephDriver } from "util/storageOptions";

export const MAIN_CONFIGURATION = "Main configuration";
export const CEPH_CONFIGURATION = "Ceph";

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
  const hasName = formik.values.name.length > 0;
  const disableReason = hasName
    ? undefined
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
        </ul>
      </nav>
    </div>
  );
};

export default StoragePoolFormMenu;
