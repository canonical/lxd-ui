import type { FC } from "react";
import { useState } from "react";
import { Button, Form, Icon } from "@canonical/react-components";
import type { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import { useClusterMembers } from "context/useClusterMembers";
import type { ClusterSpecificValues } from "types/cluster";
import ClusterSpecificSelect from "components/ClusterSpecificSelect";

interface Props {
  initialValue: ClusterSpecificValues;
  configField: ConfigField;
  onSubmit: (newValue: ClusterSpecificValues) => void;
  onCancel: () => void;
  disableReason?: string;
  readonly?: boolean;
  toggleReadOnly: () => void;
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

  const isSelect = configField.key === "core.syslog_socket";

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

  const helpText = (
    <ConfigFieldDescription description={configField.longdesc} />
  );

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      {isSelect ? (
        <ClusterSpecificSelect
          aria-label={configField.key}
          classname={readonly ? "read-only" : ""}
          disableReason={disableReason}
          id={configField.key}
          values={value}
          isReadOnly={readonly}
          onChange={(value) => {
            setValue(value);
          }}
          toggleReadOnly={toggleReadOnly}
          helpText={helpText}
          options={memberNames.map((memberName) => ({
            memberName,
            values: ["true", "false"],
          }))}
          isDefaultSpecific={Object.values(value).some(
            (item) => item !== Object.values(value)[0],
          )}
        />
      ) : (
        <ClusterSpecificInput
          aria-label={configField.key}
          classname={readonly ? "read-only" : ""}
          disableReason={disableReason}
          id={configField.key}
          values={value}
          isReadOnly={readonly}
          onChange={(value) => {
            setValue(value);
          }}
          memberNames={memberNames}
          toggleReadOnly={toggleReadOnly}
          helpText={helpText}
        />
      )}
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
