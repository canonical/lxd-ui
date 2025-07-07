import type { FC } from "react";
import { Button, Icon, Input, Label } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkMTUField: FC<Props> = ({ formik }) => {
  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="description">MTU</Label>
      </div>
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
        {formik.values.readOnly ? (
          <>
            {(formik.values.mtu?.length ?? 0 > 0) ? formik.values.mtu : "-"}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("mtu");
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
            {...formik.getFieldProps("mtu")}
            type="number"
            placeholder="Enter MTU"
            help="The MTU of the interface"
          />
        )}
      </div>
    </div>
  );
};

export default NetworkMTUField;
