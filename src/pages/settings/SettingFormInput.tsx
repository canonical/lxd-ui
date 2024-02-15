import { FC, useState } from "react";
import { Button, Form, Icon, Input } from "@canonical/react-components";
import { ConfigField } from "types/config";
import { getConfigId } from "./SettingForm";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";

interface Props {
  initialValue: string;
  configField: ConfigField;
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
    setValue(configField.default);
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        aria-label={configField.key}
        id={getConfigId(configField.key)}
        wrapperClassName="input-wrapper"
        type={getInputType()}
        value={configField.type === "bool" ? undefined : String(value)}
        onChange={(e) => setValue(e.target.value)}
        help={
          <ConfigFieldDescription
            description={configField.longdesc}
            className="p-form-help-text"
          />
        }
      />
      <Button appearance="base" onClick={onCancel}>
        Cancel
      </Button>
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
    </Form>
  );
};

export default SettingFormInput;
