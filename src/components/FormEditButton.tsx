import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  toggleReadOnly: () => void;
}

const FormEditButton: FC<Props> = ({ toggleReadOnly }) => {
  return (
    <Button
      onClick={toggleReadOnly}
      className="u-no-margin--bottom"
      type="button"
      appearance="base"
      title="Edit"
      hasIcon
    >
      <Icon name="edit" />
    </Button>
  );
};

export default FormEditButton;
