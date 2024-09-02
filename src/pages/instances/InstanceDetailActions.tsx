import { FC, cloneElement, useState } from "react";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import { LxdInstance } from "types/instance";
import MigrateInstanceBtn from "./actions/MigrateInstanceBtn";
import CreateImageFromInstanceBtn from "./actions/CreateImageFromInstanceBtn";
import DuplicateInstanceBtn from "./actions/DuplicateInstanceBtn";
import { ContextualMenu } from "@canonical/react-components";
import { isWidthBelow } from "util/helpers";
import useEventListener from "@use-it/event-listener";
import ExportInstanceBtn from "pages/instances/actions/ExportInstanceBtn";

interface Props {
  instance: LxdInstance;
  project: string;
  isLoading: boolean;
}

const InstanceDetailActions: FC<Props> = ({ instance, project, isLoading }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(isWidthBelow(1200));

  useEventListener("resize", () => setIsLargeScreen(isWidthBelow(1200)));
  const classname = isLargeScreen ? "p-contextual-menu__link" : "";

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
    <DuplicateInstanceBtn
      key="duplicate"
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
      {isLargeScreen ? (
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
        <>{menuElements}</>
      )}
    </>
  );
};

export default InstanceDetailActions;
