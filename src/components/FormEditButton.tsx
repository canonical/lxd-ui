import type { FC } from "react";
import { Button } from "@canonical/react-components";
import DsIcon from "components/DsIcon";

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
      <DsIcon icon="edit" />
    </Button>
  );
};

export default FormEditButton;
