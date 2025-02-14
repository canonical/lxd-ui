import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  toggleReadOnly: () => void;
  disabledReason?: string;
}

const FormEditButton: FC<Props> = ({ toggleReadOnly, disabledReason }) => {
  return (
    <Button
      onClick={toggleReadOnly}
      className="u-no-margin--bottom"
      type="button"
      appearance="base"
      title={disabledReason ?? "Edit"}
      hasIcon
      disabled={!!disabledReason}
    >
      <Icon name="edit" />
    </Button>
  );
};

export default FormEditButton;
