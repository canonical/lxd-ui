import { type FC } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  canEdit: boolean;
  onClick: () => void;
}

const IssueNewTokenButton: FC<Props> = ({ canEdit, onClick }) => {
  return (
    <Button
      type="button"
      appearance="base"
      disabled={!canEdit}
      title={
        canEdit
          ? undefined
          : "You do not have permission to issue a new token for this identity"
      }
      className="u-no-margin--bottom"
      onClick={onClick}
      hasIcon
    >
      <Icon name="restart" />
      <span>Issue new token</span>
    </Button>
  );
};

export default IssueNewTokenButton;
