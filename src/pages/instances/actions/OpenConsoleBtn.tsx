import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenConsoleBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    if (instance.type === "virtual-machine" && instance.status === "Running") {
      navigate(
        `/ui/${instance.project}/instances/detail/${instance.name}/vga-console`
      );
    } else {
      navigate(
        `/ui/${instance.project}/instances/detail/${instance.name}/text-console`
      );
    }
  };

  return (
    <Button
      aria-label="Open console"
      appearance="base"
      dense
      hasIcon
      onClick={handleOpen}
      title="Console"
    >
      <Icon name="canvas" />
    </Button>
  );
};

export default OpenConsoleBtn;
