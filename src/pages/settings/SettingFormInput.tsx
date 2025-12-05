import type { FC } from "react";
import { useState } from "react";
import { Button, Form, Icon, Input } from "@canonical/react-components";
import type { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";

interface Props {
  initialValue: string;
  configField: ConfigField;
  onSubmit: (newValue: string | boolean) => void;
  onDelete: (key: string) => void;
  onCancel: () => void;
}

const SettingFormInput: FC<Props> = ({
  initialValue,
  configField,
  onSubmit,
  onDelete,
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

  const canBeReset =
    !configField.isUserDefined && String(configField.default) !== String(value);

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
        id={configField.key}
        wrapperClassName="input-wrapper"
        type={getInputType()}
        value={configField.type === "bool" ? undefined : String(value)}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        help={<ConfigFieldDescription description={configField.longdesc} />}
      />
      <Button appearance="base" onClick={onCancel}>
        Cancel
      </Button>
      <Button appearance="positive" type="submit">
        Save
      </Button>
      {configField.isUserDefined && (
        <Button
          appearance="base"
          hasIcon
          className="delete-button"
          type="button"
          onClick={() => {
            onDelete(configField.key);
          }}
        >
          <Icon name="delete"></Icon>
          <span>Delete</span>
        </Button>
      )}
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
