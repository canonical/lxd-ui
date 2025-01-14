import { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { FormikProps } from "formik/dist/types";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import type { LxdStorageVolumeContentType } from "types/storage";
import { driversWithFilesystemSupport, zfsDriver } from "util/storageOptions";

export const MAIN_CONFIGURATION = "Main configuration";
export const SNAPSHOTS = "Snapshots";
export const FILESYSTEM = "Filesystem";
export const ZFS = "ZFS";

interface Props {
  active: string;
  setActive: (val: string) => void;
  formik: FormikProps<StorageVolumeFormValues>;
  poolDriver: string;
  contentType: LxdStorageVolumeContentType;
}

const StorageVolumeFormMenu: FC<Props> = ({
  active,
  setActive,
  formik,
  poolDriver,
  contentType,
}) => {
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
  };

  const hasName = formik.values.name.length > 0;
  const disableReason = hasName
    ? undefined
    : "Please enter a volume name to enable this section";

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);
  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Storage volume form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <MenuItem
            label={SNAPSHOTS}
            {...menuItemProps}
            disableReason={disableReason}
          />
          {contentType === "filesystem" &&
            driversWithFilesystemSupport.includes(poolDriver) && (
              <MenuItem
                label={FILESYSTEM}
                {...menuItemProps}
                disableReason={disableReason}
              />
            )}
          {poolDriver === zfsDriver && (
            <MenuItem
              label={ZFS}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
        </ul>
      </nav>
    </div>
  );
};

export default StorageVolumeFormMenu;
