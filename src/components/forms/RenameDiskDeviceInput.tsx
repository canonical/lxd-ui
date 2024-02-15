import { FC, useState } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";

interface Props {
  name: string;
  index: number;
  setName: (val: string) => void;
  readOnly: boolean;
}

const RenameDiskDeviceInput: FC<Props> = ({
  name,
  index,
  setName,
  readOnly,
}) => {
  const [isEditing, setEditing] = useState(false);

  if (readOnly) {
    return (
      <div className="rename-disk-device device-name">
        <b>{name}</b>
      </div>
    );
  }

  return (
    <div className="rename-disk-device device-name">
      {isEditing ? (
        <Input
          autoFocus
          className="u-no-margin--bottom"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <>
          <Label forId={`pool-${index}-pool-name`}>
            <b>{name}</b>
          </Label>
          <Button
            id={`pool-${index}-pool-name`}
            hasIcon
            onClick={() => setEditing(true)}
            appearance="base"
            className="u-no-margin--bottom"
            aria-label={`Rename disk device`}
          >
            <Icon name="edit" />
          </Button>
        </>
      )}
    </div>
  );
};

export default RenameDiskDeviceInput;
