import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  onSelect: () => void;
  disabledReason?: string;
}

const NewProxyBtn: FC<Props> = ({ onSelect, disabledReason }) => {
  return (
    <Button
      onClick={onSelect}
      type="button"
      hasIcon
      disabled={!!disabledReason}
      title={disabledReason}
    >
      <Icon name="plus" />
      <span>New Proxy Device</span>
    </Button>
  );
};
export default NewProxyBtn;
