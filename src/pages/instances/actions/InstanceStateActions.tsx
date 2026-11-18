import type { FC, ReactNode } from "react";
import type { LxdInstance } from "types/instance";
import StartInstanceBtn from "pages/instances/actions/StartInstanceBtn";
import StopInstanceBtn from "pages/instances/actions/StopInstanceBtn";
import FreezeInstanceBtn from "pages/instances/actions/FreezeInstanceBtn";
import RestartInstanceBtn from "pages/instances/actions/RestartInstanceBtn";
import classnames from "classnames";
import { List } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  instanceLink: ReactNode;
  className?: string;
}

const InstanceStateActions: FC<Props> = ({
  instance,
  instanceLink,
  className,
}) => {
  return (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={[
        <StartInstanceBtn
          key="start"
          instance={instance}
          instanceLink={instanceLink}
        />,
        <RestartInstanceBtn
          key="restart"
          instance={instance}
          instanceLink={instanceLink}
        />,
        <FreezeInstanceBtn
          key="freeze"
          instance={instance}
          instanceLink={instanceLink}
        />,
        <StopInstanceBtn
          key="stop"
          instance={instance}
          instanceLink={instanceLink}
        />,
      ]}
    />
  );
};

export default InstanceStateActions;
