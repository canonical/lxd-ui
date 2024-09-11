import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  onSelect: () => void;
}

const NewProxyBtn: FC<Props> = ({ onSelect }) => {
  return (
    <Button onClick={onSelect} type="button" hasIcon>
      <Icon name="plus" />
      <span>New Proxy Device</span>
    </Button>
  );
};
export default NewProxyBtn;
