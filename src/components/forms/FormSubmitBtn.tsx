import { FC } from "react";
import { ActionButton } from "@canonical/react-components";
import { pluralize } from "util/instanceBulkActions";
import { ConfigurationRowFormikProps } from "components/ConfigurationRow";
import { getFormChangeCount } from "util/formChangeCount";

interface Props {
  formik: ConfigurationRowFormikProps;
  disabled: boolean;
  isYaml?: boolean;
}

const FormSubmitBtn: FC<Props> = ({ formik, disabled, isYaml = false }) => {
  const changeCount = getFormChangeCount(formik);

  return (
    <ActionButton
      appearance="positive"
      loading={formik.isSubmitting}
      disabled={!formik.isValid || disabled || changeCount === 0}
      onClick={() => void formik.submitForm()}
    >
      {changeCount === 0 || isYaml
        ? "Save changes"
        : `Save ${changeCount} ${pluralize("change", changeCount)}`}
    </ActionButton>
  );
};

export default FormSubmitBtn;
