import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  instance: LxdInstance;
}

const OpenConsoleBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(
      `${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/console`,
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
