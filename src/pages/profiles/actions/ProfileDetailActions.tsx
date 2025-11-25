import type { FC } from "react";
import { cloneElement } from "react";
import DeleteProfileBtn from "./DeleteProfileBtn";
import type { LxdProfile } from "types/profile";
import CopyProfileBtn from "./CopyProfileBtn";
import {
  largeScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import { ContextualMenu } from "@canonical/react-components";

interface Props {
  profile: LxdProfile;
  project: string;
}

const ProfileDetailActions: FC<Props> = ({ profile, project }) => {
  const isSmallScreen = useIsScreenBelow(largeScreenBreakpoint);
  const classname = isSmallScreen
    ? "p-contextual-menu__link"
    : "p-segmented-control__button";

  const menuElements = [
    <CopyProfileBtn key="copy" profile={profile} className={classname} />,
    <DeleteProfileBtn
      key="delete"
      profile={profile}
      project={project}
      className={classname}
    />,
  ];

  return (
    <>
      {isSmallScreen ? (
        <ContextualMenu
          closeOnOutsideClick={false}
          toggleLabel="Actions"
          position="left"
          hasToggleIcon
          title="actions"
        >
          {(close: () => void) => (
            <span>
              {[...menuElements].map((item) =>
                cloneElement(item, { onClose: close }),
              )}
            </span>
          )}
        </ContextualMenu>
      ) : (
        <div className="p-segmented-control">
          <div className="p-segmented-control__list">{menuElements}</div>
        </div>
      )}
    </>
  );
};

export default ProfileDetailActions;
