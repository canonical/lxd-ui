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
    navigate(
      `/ui/project/${instance.project}/instances/detail/${instance.name}/console`
    );
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
