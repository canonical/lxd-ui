import React, { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";

export const MAIN_CONFIGURATION = "Main configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
}

const StoragePoolFormMenu: FC<Props> = ({ active, setActive }) => {
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
      <nav aria-label="Storage pool form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
        </ul>
      </nav>
    </div>
  );
};

export default StoragePoolFormMenu;
