import type { FC } from "react";
import { cloneElement, useState } from "react";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import type { LxdInstance } from "types/instance";
import MigrateInstanceBtn from "./actions/MigrateInstanceBtn";
import CreateImageFromInstanceBtn from "./actions/CreateImageFromInstanceBtn";
import CopyInstanceBtn from "./actions/CopyInstanceBtn";
import { ContextualMenu } from "@canonical/react-components";
import { isWidthBelow } from "util/helpers";
import useEventListener from "util/useEventListener";
import ExportInstanceBtn from "pages/instances/actions/ExportInstanceBtn";

interface Props {
  instance: LxdInstance;
  project: string;
  isLoading: boolean;
}

const InstanceDetailActions: FC<Props> = ({ instance, project, isLoading }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(isWidthBelow(1200));

  useEventListener("resize", () => {
    setIsSmallScreen(isWidthBelow(1200));
  });
  const classname = isSmallScreen
    ? "p-contextual-menu__link"
    : "p-segmented-control__button";

  const menuElements = [
    <MigrateInstanceBtn
      key="migrate"
      instance={instance}
      project={project}
      classname={classname}
    />,
    <CreateImageFromInstanceBtn
      key="publish"
      instance={instance}
      classname={classname}
    />,
    <CopyInstanceBtn
      key="copy"
      instance={instance}
      isLoading={isLoading}
      classname={classname}
    />,
    <ExportInstanceBtn
      key="export"
      instance={instance}
      classname={classname}
    />,
    <DeleteInstanceBtn
      key="delete"
      instance={instance}
      classname={classname}
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

export default InstanceDetailActions;
