import React, { FC, useState } from "react";
import { Button, Icon, Input } from "@canonical/react-components";
import { LxdConfigOption } from "types/config";
import { getConfigId } from "./SettingForm";

interface Props {
  initialValue: string;
  configField: LxdConfigOption;
  onSubmit: (newValue: string | boolean) => void;
  onCancel: () => void;
}

const SettingFormInput: FC<Props> = ({
  initialValue,
  configField,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue);

  const getInputType = () => {
    switch (configField.type) {
      case "integer":
        return "number";
      default:
        return "text";
    }
  };

  const canBeReset = String(configField.default) !== String(value);

  const resetToDefault = () => {
    setValue(configField.default as string);
  };

  return (
    <>
      <Input
        id={getConfigId(configField.key)}
        wrapperClassName="input-wrapper"
        type={getInputType()}
        value={configField.type === "bool" ? undefined : String(value)}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={onCancel}>Cancel</Button>
      <Button appearance="positive" onClick={() => onSubmit(value)}>
        Save
      </Button>
      {canBeReset && (
        <Button
          className="reset-button"
          appearance="base"
          onClick={resetToDefault}
          hasIcon
        >
          <Icon name="restart" className="flip-horizontally" />
          <span>Reset to default</span>
        </Button>
      )}
    </>
  );
};

export default SettingFormInput;
