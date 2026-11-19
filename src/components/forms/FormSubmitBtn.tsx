import type { FC } from "react";
import { ActionButton } from "@canonical/react-components";
import { pluralize } from "util/helpers";
import type { ConfigurationRowFormikProps } from "types/forms/configurationRow";
import { getFormChangeCount } from "util/formChangeCount";
import useUnsavedChangesGuard from "util/useUnsavedChangesGuard";

interface Props {
  formik: ConfigurationRowFormikProps;
  baseUrl: string;
  includeSubPaths?: boolean;
  disabled: boolean;
  isYaml?: boolean;
}

const FormSubmitBtn: FC<Props> = ({
  formik,
  baseUrl,
  includeSubPaths,
  disabled,
  isYaml = false,
}) => {
  const changeCount = getFormChangeCount(formik);
  useUnsavedChangesGuard(changeCount > 0, baseUrl, includeSubPaths);

  return (
    <ActionButton
      appearance="positive"
      loading={formik.isSubmitting}
      disabled={
        !formik.isValid || formik.isSubmitting || disabled || changeCount === 0
      }
      onClick={() => void formik.submitForm()}
    >
      {changeCount === 0 || isYaml
        ? "Save changes"
        : `Save ${changeCount} ${pluralize("change", changeCount)}`}
    </ActionButton>
  );
};

export default FormSubmitBtn;
