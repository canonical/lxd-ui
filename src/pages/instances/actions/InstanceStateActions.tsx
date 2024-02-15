import { FC } from "react";
import { LxdInstance } from "types/instance";
import StartInstanceBtn from "pages/instances/actions/StartInstanceBtn";
import StopInstanceBtn from "pages/instances/actions/StopInstanceBtn";
import FreezeInstanceBtn from "pages/instances/actions/FreezeInstanceBtn";
import RestartInstanceBtn from "pages/instances/actions/RestartInstanceBtn";
import classnames from "classnames";
import { List } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  className?: string;
}

const InstanceStateActions: FC<Props> = ({ instance, className }) => {
  return (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={[
        <StartInstanceBtn key="start" instance={instance} />,
        <RestartInstanceBtn key="restart" instance={instance} />,
        <FreezeInstanceBtn key="freeze" instance={instance} />,
        <StopInstanceBtn key="stop" instance={instance} />,
      ]}
    />
  );
};

export default InstanceStateActions;
