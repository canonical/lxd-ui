import { FC, useState } from "react";
import { Button, Form, Icon } from "@canonical/react-components";
import type { ConfigField } from "types/config";
import { getConfigId } from "./SettingForm";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import { useClusterMembers } from "context/useClusterMembers";
import { ClusterSpecificValues } from "components/ClusterSpecificSelect";

interface Props {
  initialValue: ClusterSpecificValues;
  configField: ConfigField;
  onSubmit: (newValue: ClusterSpecificValues) => void;
  onCancel: () => void;
  disableReason?: string;
  readonly?: boolean;
  toggleReadOnly?: () => void;
}

const ClusteredSettingFormInput: FC<Props> = ({
  disableReason,
  initialValue,
  configField,
  onSubmit,
  onCancel,
  readonly = false,
  toggleReadOnly,
}) => {
  const [value, setValue] = useState<ClusterSpecificValues>(initialValue);

  const { data: clusterMembers = [] } = useClusterMembers();
  const memberNames = clusterMembers.map((member) => member.server_name);

  const canBeReset = Object.values(value).some(
    (v) => v !== configField.default,
  );

  const resetToDefault = () => {
    const defaultValues: { [key: string]: string } = {};
    memberNames.forEach((name) => {
      defaultValues[name] = configField.default;
    });
    setValue(defaultValues);
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <ClusterSpecificInput
        aria-label={configField.key}
        disableReason={disableReason}
        id={getConfigId(configField.key)}
        values={value}
        isReadOnly={readonly}
        onChange={(value) => setValue(value)}
        memberNames={memberNames}
        toggleReadOnly={toggleReadOnly}
        helpText={
          <ConfigFieldDescription
            description={configField.longdesc}
            className="p-form-help-text"
          />
        }
      />
      {!readonly && (
        <>
          <Button appearance="base" onClick={onCancel}>
            Cancel
          </Button>
          <Button appearance="positive" type="submit">
            Save
          </Button>
          {canBeReset && (
            <Button
              className="reset-button"
              appearance="base"
              type="button"
              onClick={resetToDefault}
              hasIcon
            >
              <Icon name="restart" className="flip-horizontally" />
              <span>Reset to default</span>
            </Button>
          )}
        </>
      )}
    </Form>
  );
};

export default ClusteredSettingFormInput;
