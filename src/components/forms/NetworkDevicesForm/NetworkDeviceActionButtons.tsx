import { Button, Icon } from "@canonical/react-components";
import type { FC } from "react";
import type { InstanceAndProfileFormikProps } from "../instanceAndProfileFormValues";

interface Props {
  readOnly: boolean;
  formik: InstanceAndProfileFormikProps;
  onClickEdit: () => void;
  onClickDetach: () => void;
  detachLabel: string;
}

const NetworkDeviceActionButtons: FC<Props> = ({
  readOnly,
  formik,
  onClickEdit,
  onClickDetach,
  detachLabel,
}: Props) => {
  return (
    <div>
      {readOnly && (
        <Button
          onClick={onClickEdit}
          type="button"
          appearance="base"
          title={formik.values.editRestriction ?? "Edit network"}
          className="u-no-margin--top"
          hasIcon
          dense
          disabled={!!formik.values.editRestriction}
        >
          <Icon name="edit" />
        </Button>
      )}
      <Button
        className="delete-device u-no-margin--top"
        onClick={onClickDetach}
        type="button"
        appearance="base"
        hasIcon
        dense
        title={formik.values.editRestriction ?? "Detach network"}
        disabled={!!formik.values.editRestriction}
      >
        <Icon name="disconnect" />
        <span>{detachLabel}</span>
      </Button>
    </div>
  );
};

export default NetworkDeviceActionButtons;
