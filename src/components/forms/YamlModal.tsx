import type { ReactNode } from "react";
import { useState, useEffect, type FC } from "react";
import { Modal } from "@canonical/react-components";
import YamlForm from "components/forms/YamlForm";

interface Props {
  title: ReactNode;
  onClose: () => void;
  applyChanges: (newValue: string) => void;
  readOnly?: boolean;
  readOnlyMessage?: string;
  initialValue: string;
}

const YamlModal: FC<Props> = ({
  title,
  onClose,
  applyChanges,
  readOnly,
  readOnlyMessage,
  initialValue,
}) => {
  const [value, setValue] = useState<string>(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const handleClose = () => {
    if (!readOnly) {
      applyChanges(value);
    }
    onClose();
  };

  return (
    <Modal
      close={handleClose}
      title={title}
      className="cloud-init-full-editor-modal"
      closeOnOutsideClick={false}
    >
      <div className="cloud-init-modal-content">
        <YamlForm
          yaml={value}
          setYaml={setValue}
          readOnly={readOnly}
          readOnlyMessage={readOnlyMessage}
          autoResize
        />
      </div>
    </Modal>
  );
};

export default YamlModal;
