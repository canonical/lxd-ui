import type { FC } from "react";
import { Button } from "@canonical/react-components";
import DsIcon from "components/DsIcon";

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
      <DsIcon icon="plus" />
      <span>New Proxy Device</span>
    </Button>
  );
};
export default NewProxyBtn;
