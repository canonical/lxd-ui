import type { FC } from "react";
import { useState } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";

interface Props {
  name: string;
  index: number;
  setName: (val: string) => void;
  disableReason?: string;
}

const RenameDeviceInput: FC<Props> = ({
  name,
  index,
  setName,
  disableReason,
}) => {
  const [isEditing, setEditing] = useState(false);

  return (
    <div className="rename-device device-name">
      {isEditing ? (
        <Input
          autoFocus
          className="u-no-margin--bottom"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={() => {
            setEditing(false);
          }}
        />
      ) : (
        <>
          <Label forId={`device-${index}-name`}>
            <b>{name}</b>
          </Label>
          <Button
            id={`device-${index}-name`}
            hasIcon
            dense
            onClick={() => {
              setEditing(true);
            }}
            appearance="base"
            className="u-no-margin--bottom"
            aria-label={`Rename device`}
            disabled={!!disableReason}
            title={disableReason}
          >
            <Icon name="edit" />
          </Button>
        </>
      )}
    </div>
  );
};

export default RenameDeviceInput;
