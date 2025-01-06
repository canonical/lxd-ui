import { FC } from "react";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { Button, Icon, Label } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  props?: Record<string, unknown>;
  formik: FormikProps<NetworkFormValues>;
}

const NetworkDescriptionField: FC<Props> = ({ props, formik }) => {
  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="description">Description</Label>
      </div>
      <div className="general-field-content">
        {formik.values.readOnly ? (
          <>
            {(formik.values.description?.length ?? 0 > 0)
              ? formik.values.description
              : "-"}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("description");
              }}
              className="u-no-margin--bottom"
              type="button"
              appearance="base"
              title="Edit"
              hasIcon
            >
              <Icon name="edit" />
            </Button>
          </>
        ) : (
          <AutoExpandingTextArea {...props} />
        )}
      </div>
    </div>
  );
};

export default NetworkDescriptionField;
