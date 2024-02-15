import { FC, useState } from "react";
import { Button, Form, Icon, Input } from "@canonical/react-components";
import { ConfigField } from "types/config";
import { getConfigId } from "./SettingForm";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";

interface Props {
  isSet: boolean;
  configField: ConfigField;
  onSubmit: (newValue: string | boolean) => void;
  onCancel: () => void;
}

const SettingFormPassword: FC<Props> = ({
  isSet,
  configField,
  onSubmit,
  onCancel,
}) => {
  const [showPasswordField, setShowPasswordField] = useState(!isSet);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(password);
      }}
    >
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      {showPasswordField && (
        <>
          <div className="input-row">
            <Input
              aria-label={configField.key}
              id={getConfigId(configField.key)}
              wrapperClassName="input-wrapper"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              help={
                <ConfigFieldDescription
                  description={configField.longdesc}
                  className="p-form-help-text"
                />
              }
            />
            <Button
              appearance="base"
              hasIcon
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="toggle password visibility"
            >
              <Icon name={showPassword ? "hide" : "show"} />
            </Button>
          </div>
          <Button appearance="base" onClick={onCancel}>
            Cancel
          </Button>
          <Button appearance="positive" onClick={() => onSubmit(password)}>
            Save
          </Button>
        </>
      )}
      {!showPasswordField && (
        <>
          <Button appearance="base" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => setShowPasswordField(true)}>Change</Button>
          <Button appearance="negative" onClick={() => onSubmit("")}>
            Remove
          </Button>
        </>
      )}
    </Form>
  );
};

export default SettingFormPassword;
