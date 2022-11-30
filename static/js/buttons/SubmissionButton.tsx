import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import { FormikValues } from "formik";

type Props = {
  formik: FormikValues;
  buttonLabel: string;
  processingText?: string;
  checkDirty?: boolean;
};

const SubmissionButton: FC<Props> = ({
  formik,
  buttonLabel,
  processingText = "Processing...",
  checkDirty = false,
}) => {
  return formik.isSubmitting ? (
    <Button appearance="positive" type="submit" hasIcon disabled>
      <i className="p-icon--spinner is-light u-animation--spin"></i>{" "}
      <span>{processingText}</span>
    </Button>
  ) : (
    <Button
      appearance="positive"
      type="submit"
      disabled={checkDirty ? !formik.dirty || !formik.isValid : !formik.isValid}
    >
      {buttonLabel}
    </Button>
  );
};

export default SubmissionButton;
