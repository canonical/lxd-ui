import { FC, useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { FormikProps } from "formik/dist/types";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { LxdStorageVolumeContentType } from "types/storage";
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
  isCreating: boolean;
}

const StorageVolumeFormMenu: FC<Props> = ({
  active,
  setActive,
  formik,
  poolDriver,
  contentType,
  isCreating,
}) => {
  const notify = useNotify();
  const [isAdvancedOpen, setAdvancedOpen] = useState(!isCreating);
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
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default StorageVolumeFormMenu;
