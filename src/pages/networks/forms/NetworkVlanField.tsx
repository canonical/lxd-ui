import type { FC } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkVlanField: FC<Props> = ({ formik }) => {
  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="description">VLAN Id</Label>
      </div>
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
        {formik.values.readOnly ? (
          <>
            {(formik.values.vlan?.length ?? 0 > 0) ? formik.values.vlan : "-"}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("vlan");
              }}
              className="u-no-margin--bottom"
              type="button"
              appearance="base"
              title={formik.values.editRestriction ?? "Edit"}
              hasIcon
              disabled={!!formik.values.editRestriction}
            >
              <Icon name="edit" />
            </Button>
          </>
        ) : (
          <Input
            {...formik.getFieldProps("vlan")}
            type="number"
            placeholder="Enter VLAN ID"
            help="The VLAN ID to attach to"
          />
        )}
      </div>
    </div>
  );
};

export default NetworkVlanField;
