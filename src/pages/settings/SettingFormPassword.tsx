import React, { FC, useState } from "react";
import { Button, Icon, Input } from "@canonical/react-components";
import { LxdConfigField } from "types/config";
import { getConfigId } from "./SettingForm";

interface Props {
  isSet: boolean;
  configField: LxdConfigField;
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
    <>
      {showPasswordField && (
        <>
          <div className="input-row">
            <Input
              label={configField.key}
              labelClassName="u-off-screen"
              id={getConfigId(configField.key)}
              wrapperClassName="input-wrapper"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <Button onClick={onCancel}>Cancel</Button>
          <Button appearance="positive" onClick={() => onSubmit(password)}>
            Save
          </Button>
        </>
      )}
      {!showPasswordField && (
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={() => setShowPasswordField(true)}>Change</Button>
          <Button appearance="negative" onClick={() => onSubmit("")}>
            Remove
          </Button>
        </>
      )}
    </>
  );
};

export default SettingFormPassword;
