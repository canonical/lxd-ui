import type { FC } from "react";
import { useState } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";
import DeviceName from "components/forms/DeviceName";
import { isDeviceModified } from "util/formChangeCount";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

interface Props {
  name: string;
  index: number;
  setName: (val: string) => void;
  disableReason?: string;
  formik: InstanceAndProfileFormikProps;
}

const RenameDeviceInput: FC<Props> = ({
  name,
  index,
  setName,
  disableReason,
  formik,
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
            <DeviceName
              name={name}
              hasChanges={isDeviceModified(formik, name)}
            />
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
