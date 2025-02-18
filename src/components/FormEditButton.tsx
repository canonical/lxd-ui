import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  toggleReadOnly: () => void;
  disableReason?: string;
}

const FormEditButton: FC<Props> = ({ toggleReadOnly, disableReason }) => {
  return (
    <Button
      onClick={toggleReadOnly}
      className="u-no-margin--bottom"
      type="button"
      appearance="base"
      title={disableReason ?? "Edit"}
      hasIcon
      disabled={!!disableReason}
    >
      <Icon name="edit" />
    </Button>
  );
};

export default FormEditButton;
