import type { FC } from "react";
import { Button, Icon, Label, Select } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkGVRPField: FC<Props> = ({ formik }) => {
  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="description">GARP Registration</Label>
      </div>
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
        {formik.values.readOnly ? (
          <>
            {(formik.values.gvrp?.length ?? 0 > 0)
              ? formik.values.gvrp === "true"
                ? "Yes"
                : "No"
              : "-"}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("gvrp");
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
          <Select
            {...formik.getFieldProps("gvrp")}
            options={[
              {
                label: "Select option",
                value: "",
              },
              {
                label: "Yes",
                value: "true",
              },
              {
                label: "No",
                value: "false",
              },
            ]}
            help="Register VLAN using GARP VLAN Registration Protocol"
          />
        )}
      </div>
    </div>
  );
};

export default NetworkGVRPField;
