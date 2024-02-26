import { FC } from "react";
import { ConfirmationModal } from "@canonical/react-components";

interface Props {
  onConfirm: () => void;
  close: () => void;
}

const YamlConfirmation: FC<Props> = ({ onConfirm, close }) => {
  return (
    <ConfirmationModal
      confirmButtonLabel="Discard changes"
      onConfirm={onConfirm}
      close={close}
      title="Confirm"
    >
      <p>
        Switching back to guided forms will discard all changes in the YAML
        editor.
        <br />
        Are you sure you want to proceed?
      </p>
    </ConfirmationModal>
  );
};

export default YamlConfirmation;
