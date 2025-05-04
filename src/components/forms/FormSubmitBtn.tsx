import type { FC } from "react";
import { ActionButton } from "@canonical/react-components";
import { pluralize } from "util/instanceBulkActions";
import type { ConfigurationRowFormikProps } from "components/ConfigurationRow";
import { getFormChangeCount } from "util/formChangeCount";
import { unstable_usePrompt as usePrompt } from "react-router";
import useEventListener from "util/useEventListener";

interface Props {
  formik: ConfigurationRowFormikProps;
  baseUrl: string;
  disabled: boolean;
  isYaml?: boolean;
}

const FormSubmitBtn: FC<Props> = ({
  formik,
  baseUrl,
  disabled,
  isYaml = false,
}) => {
  const changeCount = getFormChangeCount(formik);

  usePrompt({
    when: (data) => {
      return changeCount > 0 && !data.nextLocation.pathname.startsWith(baseUrl);
    },
    message: "Changes you made have not been saved. Leave site?",
  });

  const handleCloseTab = (e: BeforeUnloadEvent) => {
    if (changeCount > 0) {
      e.returnValue = "Changes you made have not been saved.";
    }
  };
  useEventListener("beforeunload", handleCloseTab);

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
