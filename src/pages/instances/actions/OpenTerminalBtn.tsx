import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  instance: LxdInstance;
}

const OpenTerminalBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(
      `${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/terminal`,
    );
  };

  const isDisabled = instance.status !== "Running";

  return (
    <Button
      appearance="base"
      dense
      hasIcon
      onClick={handleOpen}
      disabled={isDisabled}
      title="Terminal"
      aria-label="Open Terminal"
    >
      <Icon name="code" />
    </Button>
  );
};

export default OpenTerminalBtn;
