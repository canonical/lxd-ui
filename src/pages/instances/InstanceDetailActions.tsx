import { cloneElement, type FC } from "react";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import type { LxdInstance } from "types/instance";
import MigrateInstanceBtn from "./actions/MigrateInstanceBtn";
import CreateImageFromInstanceBtn from "./actions/CreateImageFromInstanceBtn";
import CopyInstanceBtn from "./actions/CopyInstanceBtn";
import { ContextualMenu } from "@canonical/react-components";
import ExportInstanceBtn from "pages/instances/actions/ExportInstanceBtn";
import StartInstanceBtn from "pages/instances/actions/StartInstanceBtn";
import StopInstanceBtn from "pages/instances/actions/StopInstanceBtn";
import RestartInstanceBtn from "pages/instances/actions/RestartInstanceBtn";
import FreezeInstanceBtn from "pages/instances/actions/FreezeInstanceBtn";
import {
  largeScreenBreakpoint,
  smallScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";

interface Props {
  instance: LxdInstance;
  project: string;
  isLoading: boolean;
}

const InstanceDetailActions: FC<Props> = ({ instance, project, isLoading }) => {
  const isSmallScreen = useIsScreenBelow(largeScreenBreakpoint);
  const isMobileScreen = useIsScreenBelow(smallScreenBreakpoint);

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
              {isMobileScreen &&
                [
                  <StartInstanceBtn
                    key="start"
                    instance={instance}
                    classname={classname}
                  />,
                  <RestartInstanceBtn
                    key="restart"
                    instance={instance}
                    classname={classname}
                  />,
                  <FreezeInstanceBtn
                    key="freeze"
                    instance={instance}
                    classname={classname}
                  />,
                  <StopInstanceBtn
                    key="stop"
                    instance={instance}
                    classname={classname}
                  />,
                ].map((item) => (
                  <span key={item.key} onClick={close}>
                    {item}
                  </span>
                ))}
              {isMobileScreen && <hr className="u-no-margin" />}
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
