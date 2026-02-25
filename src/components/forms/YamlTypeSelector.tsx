import type { FC, FormEvent } from "react";
import { useState } from "react";
import { RadioInput, usePortal } from "@canonical/react-components";
import YamlConfirmation from "components/forms/YamlConfirmation";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

export type YamlType = "local" | "expandInheritedValues";

interface Props {
  yamlType: YamlType;
  setYamlType: (yamlType: YamlType) => void;
  formik: InstanceAndProfileFormikProps;
}

const YamlTypeSelector: FC<Props> = ({ yamlType, setYamlType, formik }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [pendingYamlType, setPendingYamlType] = useState<YamlType | null>(null);

  const performSwitch = (newYamlType: YamlType) => {
    void formik.setFieldValue("yaml", undefined);

    if (newYamlType === "expandInheritedValues") {
      void formik.setFieldValue("readOnly", true);
    }

    setYamlType(newYamlType);
  };

  const handleChange = (
    newYamlType: YamlType,
    e: FormEvent<HTMLInputElement>,
  ) => {
    if (formik.values.yaml) {
      setPendingYamlType(newYamlType);
      openPortal(e);
      return;
    }

    performSwitch(newYamlType);
  };

  const handleConfirm = () => {
    if (pendingYamlType) {
      performSwitch(pendingYamlType);
    }
    setPendingYamlType(null);
    closePortal();
  };

  const handleCancel = () => {
    setPendingYamlType(null);
    closePortal();
  };

  return (
    <div className="yaml-type-radio-wrapper">
      {isOpen && (
        <Portal>
          <YamlConfirmation onConfirm={handleConfirm} close={handleCancel} />
        </Portal>
      )}
      <RadioInput
        label="Local"
        checked={yamlType === "local"}
        onChange={(e) => {
          handleChange("local", e);
        }}
      />
      <RadioInput
        label="Expand inherited values"
        checked={yamlType === "expandInheritedValues"}
        onChange={(e) => {
          handleChange("expandInheritedValues", e);
        }}
      />
    </div>
  );
};

export default YamlTypeSelector;
